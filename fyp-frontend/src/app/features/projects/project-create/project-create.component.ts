import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BucketService, ProjectBucket } from '../../../core/services/bucket.service';
import { CreateProjectRequest } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';

@Component({
    selector: 'app-project-create',
    templateUrl: './project-create.component.html',
    styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent implements OnInit {
    basicInfoForm!: FormGroup;
    detailsForm!: FormGroup;
    technologiesForm!: FormGroup;
    settingsForm!: FormGroup;

    isLinear = true;
    isSubmitting = false;
    selectedBucket: ProjectBucket | null = null;
    loadingBucket = false;

    domains = [
        { value: 'AI_ML', label: 'AI & Machine Learning', icon: 'psychology' },
        { value: 'WEB_APP', label: 'Web Application', icon: 'web' },
        { value: 'MOBILE_APP', label: 'Mobile Application', icon: 'phone_android' },
        { value: 'IOT', label: 'IoT & Embedded Systems', icon: 'devices' },
        { value: 'BLOCKCHAIN', label: 'Blockchain', icon: 'link' },
        { value: 'DATA_SCIENCE', label: 'Data Science', icon: 'analytics' },
        { value: 'CYBER_SECURITY', label: 'Cyber Security', icon: 'security' },
        { value: 'CLOUD_COMPUTING', label: 'Cloud Computing', icon: 'cloud' },
        { value: 'OTHER', label: 'Other', icon: 'category' }
    ];

    popularTechs = [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'React', 'Angular',
        'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
        'TensorFlow', 'PyTorch', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP'
    ];

    selectedTechs: string[] = [];
    customTech = '';

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private bucketService: BucketService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.initializeForms();
        this.route.queryParams.subscribe(params => {
            const bucketId = params['bucketId'] ? +params['bucketId'] : null;
            if (bucketId) {
                this.loadBucket(bucketId);
            }
        });
    }

    initializeForms(): void {
        this.basicInfoForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(10)]],
            abstract: ['', [Validators.required, Validators.minLength(50)]],
            domain: ['', Validators.required]
        });

        this.detailsForm = this.fb.group({
            problemStatement: ['', [Validators.required, Validators.minLength(100)]],
            objectives: ['', [Validators.required, Validators.minLength(50)]],
            methodology: [''],
            expectedOutcome: ['']
        });

        this.technologiesForm = this.fb.group({});

        this.settingsForm = this.fb.group({
            visibility: ['PUBLIC', Validators.required]
        });
    }

    loadBucket(bucketId: number): void {
        this.loadingBucket = true;
        this.bucketService.getBucket(bucketId).subscribe({
            next: (bucket) => {
                this.selectedBucket = bucket;
                this.prefillFromBucket(bucket);
                this.loadingBucket = false;
            },
            error: (error) => {
                const message = error?.error?.message || 'Unable to load selected bucket';
                this.snackBar.open(message, 'Close', { duration: 4000 });
                this.loadingBucket = false;
            }
        });
    }

    private prefillFromBucket(bucket: ProjectBucket): void {
        this.basicInfoForm.patchValue({
            title: bucket.title,
            abstract: bucket.description,
            domain: this.mapDepartmentToDomain(bucket)
        });

        this.detailsForm.patchValue({
            problemStatement: this.buildBucketProblemStatement(bucket),
            objectives: this.buildBucketObjectives(bucket),
            methodology: `Implement the bucket idea for ${bucket.department || 'the department'} using the selected technologies and a phased delivery plan.`,
            expectedOutcome: `A working project based on the "${bucket.title}" bucket idea, ready for team collaboration and mentor review.`
        });

        this.selectedTechs = [...(bucket.technologies || [])];
        this.settingsForm.patchValue({ visibility: 'PUBLIC' });
    }

    toggleTech(tech: string): void {
        const index = this.selectedTechs.indexOf(tech);
        if (index >= 0) {
            this.selectedTechs.splice(index, 1);
        } else {
            this.selectedTechs.push(tech);
        }
    }

    isTechSelected(tech: string): boolean {
        return this.selectedTechs.includes(tech);
    }

    addCustomTech(): void {
        const normalized = this.customTech.trim();
        if (normalized && !this.selectedTechs.includes(normalized)) {
            this.selectedTechs.push(normalized);
            this.customTech = '';
        }
    }

    removeTech(tech: string): void {
        const index = this.selectedTechs.indexOf(tech);
        if (index >= 0) {
            this.selectedTechs.splice(index, 1);
        }
    }

    onSubmit(): void {
        if (this.basicInfoForm.invalid || this.detailsForm.invalid || this.selectedTechs.length === 0) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isSubmitting = true;

        const title = this.basicInfoForm.value.title;
        const abstract = this.basicInfoForm.value.abstract;

        // 1. Check similarity before creation
        this.projectService.checkSimilarity(title, abstract).subscribe({
            next: (similarProjects) => {
                if (similarProjects && similarProjects.length > 0) {
                    // Check highest score
                    const highestScore = similarProjects[0].similarityScore;
                    
                    if (highestScore >= 85) {
                        this.snackBar.open(`A very similar project already exists (${highestScore}% match). Please make your project more unique.`, 'Close', { duration: 5000 });
                        this.isSubmitting = false;
                        return;
                    }
                    
                    // Warning for 60-84%
                    let msg = "We found similar existing projects:\n";
                    similarProjects.slice(0, 3).forEach((p: any) => {
                        msg += `- ${p.title} (${p.similarityScore}% match)\n`;
                    });
                    msg += "\nDo you still want to proceed with creating this project?";
                    
                    if (!confirm(msg)) {
                        this.isSubmitting = false;
                        return;
                    }
                }
                
                // 2. Proceed with creation
                this.executeCreateProject();
            },
            error: () => {
                // If similarity check fails, we still try to create (fallback)
                this.executeCreateProject();
            }
        });
    }

    private executeCreateProject(): void {
        const projectData: CreateProjectRequest = {
            title: this.basicInfoForm.value.title,
            abstractText: this.basicInfoForm.value.abstract,
            domain: this.basicInfoForm.value.domain,
            problemStatement: this.detailsForm.value.problemStatement,
            objectives: this.detailsForm.value.objectives,
            methodology: this.detailsForm.value.methodology,
            expectedOutcome: this.detailsForm.value.expectedOutcome,
            fullDescription: `${this.detailsForm.value.problemStatement}\n\n${this.detailsForm.value.objectives}`,
            technologies: this.selectedTechs,
            visibility: this.settingsForm.value.visibility,
            fromBucket: !!this.selectedBucket,
            bucketId: this.selectedBucket?.bucketId
        };

        this.projectService.createProject(projectData).subscribe({
            next: () => {
                const message = this.selectedBucket
                    ? 'Bucket project created successfully!'
                    : 'Project created successfully!';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.router.navigate(['/student/projects']);
            },
            error: (error) => {
                const message = error?.error?.message || 'Error creating project';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.isSubmitting = false;
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/student/projects']);
    }

    getDomainIcon(domain: string): string {
        const found = this.domains.find(d => d.value === domain);
        return found ? found.icon : 'folder';
    }

    private mapDepartmentToDomain(bucket: ProjectBucket): string {
        const technologies = (bucket.technologies || []).map(tech => tech.toLowerCase());
        if (technologies.some(tech => tech.includes('iot'))) {
            return 'IOT';
        }
        if (technologies.some(tech => tech.includes('react') || tech.includes('angular') || tech.includes('vue'))) {
            return 'WEB_APP';
        }
        if (technologies.some(tech => tech.includes('python') || tech.includes('tensorflow') || tech.includes('pytorch'))) {
            return 'AI_ML';
        }
        return 'OTHER';
    }

    private buildBucketProblemStatement(bucket: ProjectBucket): string {
        return `This project is derived from the college bucket "${bucket.title}". ${bucket.description} The implementation must address the department context, support team-based development, and deliver a usable academic project outcome.`;
    }

    private buildBucketObjectives(bucket: ProjectBucket): string {
        const technologies = (bucket.technologies || []).join(', ');
        return `Build a complete solution for "${bucket.title}", align it with the needs of ${bucket.department || 'the target stakeholders'}, and deliver it using ${technologies || 'the selected technologies'} with clear milestones and collaboration support.`;
    }
}
