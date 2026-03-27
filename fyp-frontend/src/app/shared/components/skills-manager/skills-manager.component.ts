import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillCatalogService } from '../../../core/services/skill.service';

interface Skill {
    id: number;
    name: string;
    category: string;
}

interface UserSkill {
    skillId: number;
    skillName: string;
    proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

@Component({
    selector: 'app-skills-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="skills-manager">
            <div class="skills-header">
                <h3>🛠️ Skills</h3>
                <button class="add-btn" (click)="showAddModal = true" *ngIf="editable">
                    + Add Skill
                </button>
            </div>

            <div class="skills-list" *ngIf="userSkills.length > 0">
                <div class="skill-item" *ngFor="let skill of userSkills">
                    <div class="skill-info">
                        <span class="skill-name">{{ skill.skillName }}</span>
                        <span class="skill-level" [class]="skill.proficiencyLevel.toLowerCase()">
                            {{ formatLevel(skill.proficiencyLevel) }}
                        </span>
                    </div>
                    <div class="skill-actions" *ngIf="editable">
                        <button class="edit-btn" (click)="editSkill(skill)" title="Edit">✏️</button>
                        <button class="delete-btn" (click)="removeSkill(skill)" title="Remove">🗑️</button>
                    </div>
                </div>
            </div>

            <div class="empty-state" *ngIf="userSkills.length === 0">
                <p>No skills added yet.</p>
                <button class="add-btn-large" (click)="showAddModal = true" *ngIf="editable">
                    Add Your First Skill
                </button>
            </div>

            <!-- Add/Edit Modal -->
            <div class="modal-overlay" *ngIf="showAddModal" (click)="closeModal()">
                <div class="modal" (click)="$event.stopPropagation()">
                    <div class="modal-header">
                        <h4>{{ editing ? 'Edit Skill' : 'Add Skill' }}</h4>
                        <button class="close-btn" (click)="closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Select Skill</label>
                            <select [(ngModel)]="selectedSkillId" [disabled]="editing">
                                <option value="">-- Choose a skill --</option>
                                <option *ngFor="let skill of availableSkills" [value]="skill.id">
                                    {{ skill.name }} ({{ skill.category }})
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Proficiency Level</label>
                            <div class="level-options">
                                <button 
                                    class="level-btn"
                                    [class.active]="selectedLevel === 'BEGINNER'"
                                    (click)="selectedLevel = 'BEGINNER'"
                                >
                                    🌱 Beginner
                                </button>
                                <button 
                                    class="level-btn"
                                    [class.active]="selectedLevel === 'INTERMEDIATE'"
                                    (click)="selectedLevel = 'INTERMEDIATE'"
                                >
                                    📈 Intermediate
                                </button>
                                <button 
                                    class="level-btn"
                                    [class.active]="selectedLevel === 'ADVANCED'"
                                    (click)="selectedLevel = 'ADVANCED'"
                                >
                                    ⭐ Advanced
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn" (click)="closeModal()">Cancel</button>
                        <button 
                            class="save-btn" 
                            (click)="saveSkill()"
                            [disabled]="!selectedSkillId || !selectedLevel"
                        >
                            {{ editing ? 'Update' : 'Add' }} Skill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .skills-manager {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        .skills-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .skills-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }

        .add-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .add-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .skills-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .skill-item:hover {
            background: #f0f2f5;
        }

        .skill-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .skill-name {
            font-weight: 500;
            color: #333;
        }

        .skill-level {
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 500;
        }

        .skill-level.beginner {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .skill-level.intermediate {
            background: #fff3e0;
            color: #ef6c00;
        }

        .skill-level.advanced {
            background: #e3f2fd;
            color: #1565c0;
        }

        .skill-actions {
            display: flex;
            gap: 5px;
        }

        .edit-btn, .delete-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .edit-btn:hover {
            background: #e3f2fd;
        }

        .delete-btn:hover {
            background: #ffebee;
        }

        .empty-state {
            text-align: center;
            padding: 30px;
            color: #888;
        }

        .add-btn-large {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }

        .modal-header h4 {
            margin: 0;
            color: #333;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
        }

        .modal-body {
            padding: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }

        .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
        }

        .level-options {
            display: flex;
            gap: 10px;
        }

        .level-btn {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }

        .level-btn:hover {
            border-color: #667eea;
        }

        .level-btn.active {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid #eee;
        }

        .cancel-btn {
            padding: 10px 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: white;
            cursor: pointer;
        }

        .save-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .save-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `]
})
export class SkillsManagerComponent implements OnInit {
    @Input() userId: number = 0;
    @Input() editable: boolean = true;
    @Output() skillsChanged = new EventEmitter<UserSkill[]>();

    userSkills: UserSkill[] = [];
    availableSkills: Skill[] = [];
    showAddModal = false;
    editing = false;
    editingSkill: UserSkill | null = null;
    selectedSkillId: string = '';
    selectedLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';

    constructor(private skillService: SkillCatalogService) { }

    ngOnInit(): void {
        this.loadSkills();
        this.loadUserSkills();
    }

    loadSkills(): void {
        this.skillService.getAllSkills().subscribe({
            next: (skills: any[]) => {
                this.availableSkills = skills.map((s: any) => ({
                    id: s.skillId || s.id,
                    name: s.skillName || s.name,
                    category: s.category || 'General'
                }));
            },
            error: (err: any) => {
                console.error('Failed to load skills', err);
                // Demo data
                this.availableSkills = [
                    { id: 1, name: 'JavaScript', category: 'Programming' },
                    { id: 2, name: 'Python', category: 'Programming' },
                    { id: 3, name: 'React', category: 'Frontend' },
                    { id: 4, name: 'Angular', category: 'Frontend' },
                    { id: 5, name: 'Node.js', category: 'Backend' },
                    { id: 6, name: 'Spring Boot', category: 'Backend' },
                    { id: 7, name: 'PostgreSQL', category: 'Database' },
                    { id: 8, name: 'MongoDB', category: 'Database' },
                    { id: 9, name: 'Docker', category: 'DevOps' },
                    { id: 10, name: 'AWS', category: 'Cloud' }
                ];
            }
        });
    }

    loadUserSkills(): void {
        if (this.userId) {
            this.skillService.getStudentSkills(this.userId).subscribe({
                next: (skills: any[]) => {
                    this.userSkills = skills.map((s: any) => ({
                        skillId: s.skillId,
                        skillName: s.skillName || 'Unknown',
                        proficiencyLevel: s.proficiencyLevel || 'BEGINNER'
                    }));
                },
                error: (err: any) => {
                    console.error('Failed to load user skills', err);
                }
            });
        }
    }

    formatLevel(level: string): string {
        return level.charAt(0) + level.slice(1).toLowerCase();
    }

    editSkill(skill: UserSkill): void {
        this.editing = true;
        this.editingSkill = skill;
        this.selectedSkillId = skill.skillId.toString();
        this.selectedLevel = skill.proficiencyLevel;
        this.showAddModal = true;
    }

    removeSkill(skill: UserSkill): void {
        if (confirm(`Remove ${skill.skillName} from your skills?`)) {
            this.skillService.removeStudentSkill(this.userId, skill.skillId).subscribe({
                next: () => {
                    this.userSkills = this.userSkills.filter(s => s.skillId !== skill.skillId);
                    this.skillsChanged.emit(this.userSkills);
                },
                error: (err) => {
                    console.error('Failed to remove skill', err);
                    // Remove locally for demo
                    this.userSkills = this.userSkills.filter(s => s.skillId !== skill.skillId);
                }
            });
        }
    }

    saveSkill(): void {
        if (!this.selectedSkillId || !this.selectedLevel) return;

        const skillId = parseInt(this.selectedSkillId);
        const skill = this.availableSkills.find(s => s.id === skillId);

        if (this.editing && this.editingSkill) {
            // Update existing
            this.skillService.addStudentSkill(this.userId, skillId, this.selectedLevel).subscribe({
                next: () => {
                    const index = this.userSkills.findIndex(s => s.skillId === skillId);
                    if (index !== -1) {
                        this.userSkills[index].proficiencyLevel = this.selectedLevel;
                    }
                    this.skillsChanged.emit(this.userSkills);
                    this.closeModal();
                },
                error: () => {
                    // Update locally for demo
                    const index = this.userSkills.findIndex(s => s.skillId === skillId);
                    if (index !== -1) {
                        this.userSkills[index].proficiencyLevel = this.selectedLevel;
                    }
                    this.closeModal();
                }
            });
        } else {
            // Add new
            const newSkill: UserSkill = {
                skillId: skillId,
                skillName: skill?.name || 'Unknown',
                proficiencyLevel: this.selectedLevel
            };

            this.skillService.addStudentSkill(this.userId, skillId, this.selectedLevel).subscribe({
                next: () => {
                    this.userSkills.push(newSkill);
                    this.skillsChanged.emit(this.userSkills);
                    this.closeModal();
                },
                error: () => {
                    // Add locally for demo
                    this.userSkills.push(newSkill);
                    this.closeModal();
                }
            });
        }
    }

    closeModal(): void {
        this.showAddModal = false;
        this.editing = false;
        this.editingSkill = null;
        this.selectedSkillId = '';
        this.selectedLevel = 'BEGINNER';
    }
}
