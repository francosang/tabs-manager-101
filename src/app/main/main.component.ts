import { Tab, Window } from "../domain";
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  tabs: Tab[] = [];

  windows: Window[] = [];
  currentWindow?: Window;

  query?: string;

  async ngOnInit(): Promise<void> {
    await this.loadWindows();
  }

  async loadWindows(): Promise<void> {
    const fetchedWindows = await browser.windows.getAll();

    this.windows = fetchedWindows.map((w, index) => {
      return <Window>{
        id: w.id,
        active: w.focused,
        name: `Window ${index + 1}`,
      }
    });
    this.currentWindow = this.windows.find(w => w.active);

    await this.loadTabs();
  }

  async loadTabs(): Promise<void> {
    const fetchedTabs = await browser.tabs.query({ windowId: this.currentWindow?.id });

    this.tabs = fetchedTabs
      .map(tab => <Tab>{
        id: tab.id,
        url: tab.url,
        name: tab.title,
        icon: tab.favIconUrl,
        winId: tab.windowId,
        lastAccessed: tab.lastAccessed,
      })
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
        (t) => t.url.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
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
}
