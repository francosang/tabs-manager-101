import { Tab, Window } from "../domain";
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {

  tabs: Tab[] = [];
  windows: Window[] = [];
  query?: string;

  ngOnInit(): void {
    this.loadTabs();
  }

  async loadTabs(): Promise<void> {
    const [fetchedTabs, fetchedWindows] = await Promise.all([
      browser.tabs.query({ currentWindow: true }),
      browser.windows.getAll(),
    ]);

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

    this.windows = fetchedWindows.map((w, index) => {
      return <Window>{
        id: w.id,
        active: w.focused,
        name: `Window ${index + 1}`,
      }
    });
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

  async newWindow() {
    await this.loadTabs();
  }
}
