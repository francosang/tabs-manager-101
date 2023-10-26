import { Component, Input } from '@angular/core';
import { Tab, Window } from '../domain';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.css']
})
export class TabItemComponent {
  @Input() tab!: Tab;
  @Input() windows!: Array<Window>;

  @Output() onTabSelected = new EventEmitter<Tab>();
  @Output() onTabDuplicated = new EventEmitter<Tab>();
  @Output() onTabDeleted = new EventEmitter<Tab>();
  @Output() onTabMovedToWindow = new EventEmitter<[Tab, Window]>();
  @Output() onTabMovedToNewWindow = new EventEmitter<Tab>();

  onSelect() {
    this.onTabSelected.emit(this.tab);
  }

  onDelete() {
    this.onTabDeleted.emit(this.tab);
  }

  onDuplicate() {
    this.onTabDuplicated.emit(this.tab);
  }

  moveToWindow(window: Window) {
    this.onTabMovedToWindow.emit([this.tab, window]);
  }

  moveToNew() {
    this.onTabMovedToNewWindow.emit(this.tab);
  }
}
