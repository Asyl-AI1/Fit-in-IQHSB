const app = {
    // --- Data Management ---
    keys: {
        profile: 'fit_iqhsb_profile',
        equipment: 'fit_iqhsb_equipment',
        plans: 'fit_iqhsb_plans'
    },

    // --- Profile Module ---
    profile: {
        load: function() {
            const data = JSON.parse(localStorage.getItem(app.keys.profile));
            if (data) {
                document.getElementById('name').value = data.name;
                document.getElementById('class').value = data.class;
                document.getElementById('age').value = data.age;
                document.getElementById('sex').value = data.sex;
                document.getElementById('weight').value = data.weight_kg;
                document.getElementById('height').value = data.height_cm;
                document.getElementById('goal').value = data.goal;
                document.getElementById('fitnessLevel').value = data.fitnessLevel;
                document.getElementById('injuries').value = data.injuries;
                document.getElementById('availableTime').value = data.availableTime;
                document.getElementById('blackoutPeriods').value = data.blackoutPeriods;
            }
        },
        save: function() {
            const profileData = {
                name: document.getElementById('name').value,
                class: document.getElementById('class').value,
                age: parseInt(document.getElementById('age').value),
                sex: document.getElementById('sex').value,
                weight_kg: parseFloat(document.getElementById('weight').value),
                height_cm: parseFloat(document.getElementById('height').value),
                goal: document.getElementById('goal').value,
                fitnessLevel: document.getElementById('fitnessLevel').value,
                injuries: document.getElementById('injuries').value,
                availableTime: document.getElementById('availableTime').value,
                blackoutPeriods: document.getElementById('blackoutPeriods').value
            };
            localStorage.setItem(app.keys.profile, JSON.stringify(profileData));
        },
        get: function() {
            return JSON.parse(localStorage.getItem(app.keys.profile));
        }
    },

    // --- Equipment Module ---
    equipment: {
        seed: [
            { id: 'treadmill', name: 'Treadmill', present: true },
            { id: 'elliptical', name: 'Elliptical', present: true },
            { id: 'stationary_bike', name: 'Stationary Bike', present: true },
            { id: 'dumbbells', name: 'Dumbbells (assorted)', present: true },
            { id: 'barbell', name: 'Barbell & Plates', present: true },
            { id: 'squat_rack', name: 'Squat Rack', present: true },
            { id: 'bench_press', name: 'Bench Press', present: true },
            { id: 'pullup_bar', name: 'Pull-up Bar', present: true },
            { id: 'cable_machine', name: 'Cable Machine', present: true },
            { id: 'leg_press', name: 'Leg Press Machine', present: true },
            { id: 'yoga_mat', name: 'Yoga Mats', present: true },
            { id: 'resistance_bands', name: 'Resistance Bands', present: true }
        ],
        init: function() {
            let equipment = JSON.parse(localStorage.getItem(app.keys.equipment));
            if (!equipment) {
                equipment = this.seed;
                localStorage.setItem(app.keys.equipment, JSON.stringify(equipment));
            }
            this.render(equipment);
            document.getElementById('addEquipmentBtn').addEventListener('click', this.add);
        },
        render: function(equipment) {
            const list = document.getElementById('equipmentList');
            list.innerHTML = '';
            equipment.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'list-item';
                itemDiv.innerHTML = `
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="equip-${index}" data-id="${item.id}" ${item.present ? 'checked' : ''}>
                        <label for="equip-${index}" class="flex-1">${item.name}</label>
                    </div>
                    <button class="btn btn-sm btn-outline" data-action="delete" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                list.appendChild(itemDiv);
            });
            list.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    this.togglePresence(e.target.dataset.id, e.target.checked);
                }
            });
            list.addEventListener('click', (e) => {
                if (e.target.dataset.action === 'delete') {
                    this.delete(e.target.dataset.id);
                }
            });
        },
        add: function() {
            const nameInput = document.getElementById('newEquipmentName');
            const newName = nameInput.value.trim();
            if (newName) {
                const equipment = JSON.parse(localStorage.getItem(app.keys.equipment));
                equipment.push({ id: newName.toLowerCase().replace(/\s/g, '_'), name: newName, present: true });
                localStorage.setItem(app.keys.equipment, JSON.stringify(equipment));
                nameInput.value = '';
                app.equipment.render(equipment);
            }
        },
        togglePresence: function(id, isPresent) {
            const equipment = JSON.parse(localStorage.getItem(app.keys.equipment));
            const item = equipment.find(e => e.id === id);
            if (item) {
                item.present = isPresent;
                localStorage.setItem(app.keys.equipment, JSON.stringify(equipment));
            }
        },
        delete: function(id) {
            let equipment = JSON.parse(localStorage.getItem(app.keys.equipment));
            equipment = equipment.filter(e => e.id !== id);
            localStorage.setItem(app.keys.equipment, JSON.stringify(equipment));
            this.render(equipment);
        },
        get: function() {
            return JSON.parse(localStorage.getItem(app.keys.equipment));
        }
    },

    // --- Plan Generator Module ---
    plan: {
        generateAndRender: function() {
            const profile = app.profile.get();
            const equipment = app.equipment.get();
            const output = document.getElementById('planOutput');

            if (!profile) {
                output.innerHTML = '<div class="alert-danger">Please fill out your profile first.</div>';
                return;
            }

            const plan = this.generate(profile, equipment);
            this.render(plan, profile, equipment);
            
            // Add a temporary save button to the rendered plan
            const saveBtn = document.createElement('button');
            saveBtn.id = 'savePlanBtn';
            saveBtn.className = 'btn btn-primary w-full mt-4';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save This Plan';
            output.appendChild(saveBtn);

            saveBtn.addEventListener('click', () => {
                const approver = prompt('Please enter your name for coach/medic approval:');
                app.plan.save(plan, approver);
                alert('Plan saved successfully!');
            });
        },
        
        generate: function(profile, equipment) {
            const plan = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                checkedByCoach: null,
                profile: profile,
                equipmentUsed: [],
                workoutPlan: {},
                nutritionPlan: {}
            };

            const availableEquipmentIds = new Set(equipment.filter(e => e.present).map(e => e.id));
            plan.equipmentUsed = Array.from(availableEquipmentIds);

            // Safety Check
            const safetyFlags = {
                minor: profile.age < 16,
                injuries: profile.injuries.trim() !== ''
            };
            plan.requiresCoachReview = safetyFlags.minor || safetyFlags.injuries;

            // Generate Workout Plan
            const workoutTemplates = {
                'beginner': {
                    'full_body': [
                        { name: 'Bodyweight Squats', equipment: 'bodyweight', sets: 3, reps: '10-15', rest: 60 },
                        { name: 'Push-ups', equipment: 'bodyweight', sets: 3, reps: '5-10', rest: 60, substitute: 'Knee Push-ups' },
                        { name: 'Dumbbell Rows', equipment: 'dumbbells', sets: 3, reps: '8-12', rest: 60, substitute: 'Resistance Band Rows' },
                        { name: 'Plank', equipment: 'bodyweight', sets: 3, reps: '30-60s', rest: 60 },
                        { name: 'Treadmill Jog', equipment: 'treadmill', sets: 1, reps: '20 min', rest: 0 }
                    ]
                },
                'intermediate': {
                    'push_pull_legs': {
                        'push': [
                            { name: 'Barbell Bench Press', equipment: 'bench_press', sets: 4, reps: '6-8', rest: 90 },
                            { name: 'Dumbbell Overhead Press', equipment: 'dumbbells', sets: 3, reps: '8-12', rest: 60 },
                            { name: 'Tricep Pushdowns', equipment: 'cable_machine', sets: 3, reps: '10-15', rest: 60 },
                            { name: 'Incline Push-ups', equipment: 'bodyweight', sets: 3, reps: '8-12', rest: 60 }
                        ],
                        'pull': [
                            { name: 'Pull-ups', equipment: 'pullup_bar', sets: 3, reps: '5-8', rest: 90, substitute: 'Lat Pulldown' },
                            { name: 'Barbell Rows', equipment: 'barbell', sets: 4, reps: '6-8', rest: 90 },
                            { name: 'Face Pulls', equipment: 'cable_machine', sets: 3, reps: '10-15', rest: 60 }
                        ],
                        'legs': [
                            { name: 'Barbell Squats', equipment: 'squat_rack', sets: 4, reps: '6-10', rest: 90 },
                            { name: 'Leg Press', equipment: 'leg_press', sets: 3, reps: '8-12', rest: 60 },
                            { name: 'Standing Calf Raises', equipment: 'bodyweight', sets: 3, reps: '15-20', rest: 60 }
                        ]
                    }
                }
            };
            const workouts = workoutTemplates[profile.fitnessLevel] ? Object.values(workoutTemplates[profile.fitnessLevel])[0] : workoutTemplates.beginner.full_body;
            
            // Check for available equipment and filter/substitute
            const filteredWorkouts = workouts.map(exercise => {
                if (exercise.equipment && exercise.equipment !== 'bodyweight' && !availableEquipmentIds.has(exercise.equipment)) {
                    // Try to find a suitable substitute if equipment is missing
                    return { ...exercise, name: `${exercise.name} (Requires missing equipment)`, equipment: null, substitute: 'Bodyweight or Resistance Band variation' };
                }
                return exercise;
            });
            
            // Create a weekly schedule
            plan.workoutPlan = {
                'Week 1-4': [filteredWorkouts, filteredWorkouts, 'Rest', filteredWorkouts, 'Rest', 'Cardio', 'Rest'],
                'Week 5-8': [filteredWorkouts, filteredWorkouts, 'Rest', filteredWorkouts, 'Rest', 'Cardio', 'Rest']
            };

            // Generate Nutritional Plan
            const activityFactors = {
                '1-3': 1.375,
                '3-5': 1.55,
                '5-7': 1.725,
                '>7': 1.9
            };
            const bmr = (profile.sex === 'male')
                ? (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5
                : (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161;
            const tdee = bmr * activityFactors[profile.availableTime];
            
            let calorieGoal = tdee;
            let macros = {};
            if (profile.goal === 'mass_gain') {
                calorieGoal += 500;
                macros = { protein: profile.weight_kg * 2.2, carbs: calorieGoal * 0.4 / 4, fats: calorieGoal * 0.3 / 9 };
            } else if (profile.goal === 'fat_loss') {
                calorieGoal -= 500;
                macros = { protein: profile.weight_kg * 2.5, carbs: calorieGoal * 0.3 / 4, fats: calorieGoal * 0.25 / 9 };
            } else { // Health, Strength, etc.
                macros = { protein: profile.weight_kg * 1.8, carbs: calorieGoal * 0.45 / 4, fats: calorieGoal * 0.3 / 9 };
            }
            
            plan.nutritionPlan = {
                bmr: bmr.toFixed(2),
                tdee: tdee.toFixed(2),
                calorieGoal: calorieGoal.toFixed(2),
                macros: {
                    protein: `${macros.protein.toFixed(2)}g`,
                    carbs: `${macros.carbs.toFixed(2)}g`,
                    fats: `${macros.fats.toFixed(2)}g`
                }
            };
            
            return plan;
        },

        render: function(plan, profile, equipment) {
            const output = document.getElementById('planOutput');
            const equipmentNames = new Set(equipment.filter(e => e.present).map(e => e.name));
            
            let planHTML = `
                <div class="card">
                    <div class="flex items-center justify-between">
                        <h2>Generated Plan</h2>
                        ${plan.requiresCoachReview ? '<span class="badge badge-danger">Coach Review Required</span>' : '<span class="badge badge-success">Review Recommended</span>'}
                    </div>
                    <p>Generated on: ${new Date(plan.createdAt).toLocaleDateString()}</p>
                    <p class="font-bold">Fitness Goal: ${profile.goal}</p>
                    ${plan.checkedByCoach ? `<p class="font-bold">Approved by: ${plan.checkedByCoach}</p>` : ''}
                </div>
            `;
            
            // Render Workout Plan
            planHTML += `
                <div class="card">
                    <h3><i class="fas fa-running"></i> Workout Plan</h3>
                    <div id="calendar-view" class="mt-4">
                        <h4>Weekly Schedule</h4>
                        <div class="grid grid-cols-7 gap-1 text-center font-bold">
                            <span class="p-2 bg-gray-200 rounded">Mon</span>
                            <span class="p-2 bg-gray-200 rounded">Tue</span>
                            <span class="p-2 bg-gray-200 rounded">Wed</span>
                            <span class="p-2 bg-gray-200 rounded">Thu</span>
                            <span class="p-2 bg-gray-200 rounded">Fri</span>
                            <span class="p-2 bg-gray-200 rounded">Sat</span>
                            <span class="p-2 bg-gray-200 rounded">Sun</span>
                        </div>
                        <div class="grid grid-cols-7 gap-1 text-center mt-2">
                            ${plan.workoutPlan['Week 1-4'].map((day, index) => {
                                const blackout = profile.blackoutPeriods.includes(new Date().toISOString().slice(0, 10)); // Basic check
                                const dayStyle = blackout ? 'bg-red-200' : 'bg-green-100';
                                return `<div class="p-2 rounded ${dayStyle} text-sm">${Array.isArray(day) ? 'Workout' : day}</div>`;
                            }).join('')}
                        </div>
                        <p class="mt-2 text-sm text-gray-500">Note: This is a general weekly template. Please adapt to your school blackout periods.</p>
                    </div>
                    <div class="mt-4">
                        <h4>Detailed Workout</h4>
                        <ul class="list-disc pl-5">
                            ${plan.workoutPlan['Week 1-4'][0].map(ex => `<li><strong>${ex.name}</strong> - Sets: ${ex.sets}, Reps: ${ex.reps}, Rest: ${ex.rest}s ${ex.substitute ? `(Sub: ${ex.substitute})` : ''}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            // Render Nutritional Plan
            planHTML += `
                <div class="card">
                    <h3><i class="fas fa-utensils"></i> Nutritional Plan</h3>
                    <p>Based on your profile, here are your estimated daily calorie and macro goals:</p>
                    <ul class="list-disc pl-5">
                        <li><strong>Calorie Goal:</strong> ${plan.nutritionPlan.calorieGoal} kcal</li>
                        <li><strong>Protein:</strong> ${plan.nutritionPlan.macros.protein}</li>
                        <li><strong>Carbs:</strong> ${plan.nutritionPlan.macros.carbs}</li>
                        <li><strong>Fats:</strong> ${plan.nutritionPlan.macros.fats}</li>
                    </ul>
                </div>
            `;

            // Render Recovery & Equipment
            planHTML += `
                <div class="grid-container">
                    <div class="card">
                        <h3><i class="fas fa-bed"></i> Recovery Recommendations</h3>
                        <ul class="list-disc pl-5">
                            <li>Aim for 8-10 hours of sleep per night.</li>
                            <li>Drink at least 2-3 liters of water per day.</li>
                            <li>Incorporate stretching or foam rolling on rest days.</li>
                        </ul>
                    </div>
                    <div class="card">
                        <h3><i class="fas fa-tools"></i> Equipment Used</h3>
                        <p>This plan primarily uses:</p>
                        <ul class="list-disc pl-5">
                            ${plan.equipmentUsed.map(id => `<li>${equipment.find(e => e.id === id)?.name || id}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            output.innerHTML = planHTML;
        },

        save: function(plan, approverName = null) {
            let plans = JSON.parse(localStorage.getItem(app.keys.plans)) || [];
            const newPlan = {
                ...plan,
                checkedByCoach: approverName,
                createdAt: new Date().toISOString()
            };
            plans.push(newPlan);
            localStorage.setItem(app.keys.plans, JSON.stringify(plans));
        }
    },

    // --- History Module ---
    history: {
        loadAndRender: function() {
            const plans = JSON.parse(localStorage.getItem(app.keys.plans)) || [];
            const profile = app.profile.get();
            const historyList = document.getElementById('historyList');
            const importFile = document.getElementById('importFile');
            const importBtn = document.getElementById('importBtn');
            const exportAllBtn = document.getElementById('exportAllBtn');

            historyList.innerHTML = '';
            if (plans.length === 0) {
                historyList.innerHTML = '<p class="text-center text-gray-500">No plans saved yet.</p>';
            } else {
                plans.forEach(plan => {
                    const planCard = document.createElement('div');
                    planCard.className = 'card';
                    planCard.innerHTML = `
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold">Plan from ${new Date(plan.createdAt).toLocaleString()}</h4>
                            ${plan.checkedByCoach ? `<span class="badge badge-success">Approved by: ${plan.checkedByCoach}</span>` : `<span class="badge badge-info">Needs Review</span>`}
                        </div>
                        <p><strong>Goal:</strong> ${plan.profile.goal}</p>
                        <p><strong>Calories:</strong> ${plan.nutritionPlan.calorieGoal} kcal</p>
                        <div class="mt-4 flex gap-2">
                            <button class="btn btn-secondary btn-sm" data-action="view" data-id="${plan.id}">View Details</button>
                            <button class="btn btn-outline btn-sm" data-action="export-single" data-id="${plan.id}">Export JSON</button>
                            <button class="btn btn-outline btn-sm" data-action="print" data-id="${plan.id}">Print PDF</button>
                        </div>
                    `;
                    historyList.appendChild(planCard);
                });
            }

            historyList.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                const id = target.dataset.id;
                const action = target.dataset.action;
                if (action === 'view') {
                    const plan = plans.find(p => p.id === id);
                    if (plan) {
                        app.plan.render(plan, profile, app.equipment.get());
                        // Create a simple pop-up or redirect for full view
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto p-4 flex items-center justify-center';
                        modal.innerHTML = `
                            <div class="bg-white p-6 rounded-lg w-full max-w-2xl h-5/6 overflow-y-auto">
                                <h3 class="text-2xl font-bold mb-4">Plan Details</h3>
                                <div id="modal-content"></div>
                                <button class="btn btn-primary mt-4" onclick="document.body.removeChild(this.parentNode.parentNode)">Close</button>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        document.getElementById('modal-content').innerHTML = app.plan.render(plan, profile, app.equipment.get());
                    }
                } else if (action === 'export-single') {
                    this.exportSingle(id, plans);
                } else if (action === 'print') {
                    // Temporarily render plan for printing
                    const tempDiv = document.createElement('div');
                    tempDiv.style.display = 'none';
                    tempDiv.innerHTML = app.plan.render(plans.find(p => p.id === id), profile, app.equipment.get());
                    document.body.appendChild(tempDiv);
                    window.print();
                    document.body.removeChild(tempDiv);
                }
            });

            exportAllBtn.addEventListener('click', this.exportAll);
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', this.import);
        },
        exportSingle: function(id, plans) {
            const plan = plans.find(p => p.id === id);
            if (plan) {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", `fit_iqhsb_plan_${new Date(plan.createdAt).toISOString().split('T')[0]}.json`);
                dlAnchorElem.click();
            }
        },
        exportAll: function() {
            const data = {
                profile: app.profile.get(),
                equipment: app.equipment.get(),
                plans: JSON.parse(localStorage.getItem(app.keys.plans)) || []
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `fit_iqhsb_data.json`);
            dlAnchorElem.click();
        },
        import: function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        if (importedData.profile) {
                            localStorage.setItem(app.keys.profile, JSON.stringify(importedData.profile));
                        }
                        if (importedData.equipment) {
                            localStorage.setItem(app.keys.equipment, JSON.stringify(importedData.equipment));
                        }
                        if (importedData.plans) {
                            localStorage.setItem(app.keys.plans, JSON.stringify(importedData.plans));
                        }
                        alert('Data imported successfully! Please reload the page to see the changes.');
                        window.location.reload();
                    } catch (error) {
                        alert('Invalid JSON file.');
                    }
                };
                reader.readAsText(file);
            }
        }
    }
};

// Seed initial data and attach event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize app.equipment if on the equipment page to avoid multiple initializations
    if (window.location.pathname.endsWith('equipment.html')) {
        app.equipment.init();
    }
});
