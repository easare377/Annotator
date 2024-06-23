import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialize with one project
    this.projects.push({
      name: 'New Project #1',
      createdAt: new Date('2024-05-25T11:25:00'),
      stats: { total: 1, success: 0, error: 0, warning: 0 },
      initials: 'GK'
    });
  }

  createProject(): void {
    this.router.navigate(['/create-project']);
    // const projectCount = this.projects.length + 1;
    // this.projects.push({
    //   name: `New Project #${projectCount}`,
    //   createdAt: new Date(),
    //   stats: { total: 1, success: 0, error: 0, warning: 0 },
    //   initials: 'GK'
    // });
  }
}

