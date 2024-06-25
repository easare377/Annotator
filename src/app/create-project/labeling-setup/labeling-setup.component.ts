import { Component, OnInit } from '@angular/core';


/**
 * Represents the Labeling Setup component.
 * This component is responsible for setting up labels with random colors.
 */
@Component({
  selector: 'app-labeling-setup',
  templateUrl: './labeling-setup.component.html',
  styleUrls: ['./labeling-setup.component.css']
})
export class LabelingSetupComponent implements OnInit {
  
  /**
   * The background color for labels.
   * @default 'white'
   */
  color: string = 'white';

  /**
   * Holds the new labels input by the user.
   */
  newLabels: string = '';

  /**
   * Holds the list of labels with their names and colors.
   */
  labels: { name: string, color: string }[] = [];

  /**
   * Initializes a new instance of the LabelingSetupComponent class.
   */
  constructor() {}

  /**
   * A lifecycle hook that is called after Angular has initialized all data-bound properties.
   */
  ngOnInit(): void {}

  /**
   * Adds new labels to the list.
   * The labels are split by new lines and each label gets a random color.
   */
  addLabels(): void {
    const labelsToAdd = this.newLabels.split('\n').filter(label => label.trim());
    this.labels.push(...labelsToAdd.map(label => ({
      name: label,
      color: this.getRandomColor()
    })));
    this.newLabels = '';
  }

  /**
   * Removes a label from the list.
   * @param labelToRemove The label to be removed.
   */
  removeLabel(labelToRemove: { name: string, color: string }): void {
    this.labels = this.labels.filter(label => label !== labelToRemove);
  }

  /**
   * Generates a random hex color code.
   * @returns A string representing a random color in hex format.
   */
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
