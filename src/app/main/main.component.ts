import { Tab, Window } from '../domain';
import { parse } from 'tldts';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';

declare const bootstrap: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  tabs: Tab[] = [];

  windows: Window[] = [];
  currentWindow?: Window;

  query?: string;

  async ngOnInit(): Promise<void> {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    await this.loadWindows();
  }

  async loadWindows(): Promise<void> {
    const fetchedWindows = await browser.windows.getAll();

    this.windows = fetchedWindows.map((w, index) => {
      return <Window>{
        id: w.id,
        active: w.focused,
        name: `Window ${index + 1}`,
      };
    });
    this.currentWindow = this.windows.find((w) => w.active);

    await this.loadTabs();
  }

  async loadTabs(): Promise<void> {
    const fetchedTabs = await browser.tabs.query({
      windowId: this.currentWindow?.id,
    });

    this.tabs = fetchedTabs
      .map(
        (tab) =>
          <Tab>{
            id: tab.id,
            url: tab.url,
            name: tab.title,
            icon: tab.favIconUrl,
            winId: tab.windowId,
            lastAccessed: tab.lastAccessed,
          }
      )
      .sort((a, b) => b.lastAccessed - a.lastAccessed);
  }

  onWindowChanged() {
    console.log('onWindowChanged()');

    this.loadTabs();
  }

  filteredTabs(): Array<Tab> {
    const query = this.query;
    if (query != null) {
      const q = query.toLowerCase();
      return this.tabs.filter(
        (t) =>
          t.url.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
      );
    }

    return this.tabs;
  }

  async selectTab(tab: Tab) {
    await browser.tabs.update(tab.id, {
      active: true,
    });
    window.close();
  }

  async removeTab(tab: Tab) {
    await browser.tabs.remove(tab.id);

    await this.loadTabs();
  }

  async duplicateTab(tab: Tab) {
    await browser.tabs.duplicate(tab.id);

    await this.loadTabs();
  }

  async changeWindow(event: [Tab, Window]) {
    const [tab, wind] = event;

    await browser.tabs.move(tab.id, {
      windowId: wind.id,
      index: -1,
    });

    await this.loadTabs();
  }

  async newWindow(tab: Tab) {
    await browser.windows.create({ tabId: tab.id });
  }

  async removeDuplicates() {
    const duplications: IterableIterator<[string, Array<number>]> = this.tabs
      .reduce((accumulator, tab) => {
        const list = accumulator.get(tab.url) ?? [];
        list.push(tab.id);
        return accumulator.set(tab.url, list);
      }, new Map<string, Array<number>>())
      .entries();

    const toDelete = Array.from(duplications)
      .filter((it) => {
        return it[1].length > 1;
      })
      .flatMap((it) => {
        return Array.from(it[1])
          .sort((a, b) => a - b)
          .splice(1, it[1].length);
      });

    await browser.tabs.remove(toDelete);
    await this.loadTabs();
  }

  async orderByDomain() {
    console.log(this.tabs);

    const tabs = this.tabs;

    tabs.sort((a, b) => {
      const resA = parse(a.url);
      if (resA == null || resA.domainWithoutSuffix == null) return -1;

      const resB = parse(b.url);
      if (resB == null || resB.domainWithoutSuffix == null) return 1;

      if (resA.domainWithoutSuffix == resB.domainWithoutSuffix) {
        if (resA == null || resA.subdomain == null) return -1;
        if (resB == null || resB.subdomain == null) return 1;

        return resA.subdomain.localeCompare(resB.subdomain);
      }

      return resA.domainWithoutSuffix.localeCompare(resB.domainWithoutSuffix);
    });

    for (let index = 0; index < tabs.length; index++) {
      const tab = tabs[index];
      await browser.tabs.move(tab.id, { index: index });
    }
  }
}
