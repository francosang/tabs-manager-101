import { Component, Input } from '@angular/core';
import { Tab } from '../domain/tab';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.css']
})
export class TabItemComponent {
  public windows: Array<String> = ["Windows 1", "Windows 2"]

  @Input() tab!: Tab;

  @Output() onTabSelected = new EventEmitter<Tab>();
  @Output() onTabDuplicated = new EventEmitter<Tab>();
  @Output() onTabDeleted = new EventEmitter<Tab>();

  onSelect() {
    this.onTabSelected.emit(this.tab);
  }

  onDelete() {
    this.onTabDeleted.emit(this.tab);
  }

  onDuplicate() {
    this.onTabDuplicated.emit(this.tab);
  }

  moveToWindow(window: String) {
    console.log('Move to', window);
  }
}
