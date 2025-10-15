// ===================================
// IMMEDIATE LOADING SCREEN REMOVAL
// ===================================
(function() {
    'use strict';
    
    function removeLoadingScreen() {
        try {
            var loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 600);
            }
        } catch (e) {
            console.error('Error removing loading screen:', e);
        }
    }
    
    // Multiple fallback mechanisms
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeLoadingScreen);
    } else {
        removeLoadingScreen();
    }
    
    // Force remove after 800ms regardless
    setTimeout(removeLoadingScreen, 800);
})();

// ===================================
// GLOBAL VARIABLES & INITIALIZATION
// ===================================

var currentTheme = 'minimal';
var autoSaveEnabled = true;
var profilePhoto = null;
var companyLogo = null;
var resumeData = {
    personal: {},
    photo: null,
    logo: null,
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    hobbies: []
};

// ===================================
// DOM CONTENT LOADED
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
        setupEventListeners();
        loadFromLocalStorage();
        generateThemes();
        updatePreview();
    } catch (e) {
        console.error('Initialization error:', e);
        showNotification('Error loading application. Please refresh.', 'error');
    }
});

// ===================================
// INITIALIZATION
// ===================================

function initializeApp() {
    showSection('personalDetailsSection');
    
    addSkillField();
    addExperienceField();
    addEducationField();
    addProjectField();
    addCertificationField();
    addLanguageField();
    addHobbyField();
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Navigation buttons
    safeAddEventListener('newResumeBtn', 'click', function() {
        if (confirm('Create a new resume? Unsaved changes will be lost.')) {
            resetForm();
            showNotification('New resume started!', 'success');
        }
    });
    
    safeAddEventListener('myResumesBtn', 'click', function() {
        loadSavedResumes();
        showSection('myResumesSection');
    });
    
    safeAddEventListener('themesBtn', 'click', function() {
        showSection('themeGallerySection');
    });
    
    safeAddEventListener('aboutBtn', 'click', function() {
        showSection('aboutSection');
    });
    
    // Back buttons
    safeAddEventListener('backToFormBtn', 'click', function() {
        showSection('personalDetailsSection');
    });
    
    safeAddEventListener('backToFormBtn2', 'click', function() {
        showSection('personalDetailsSection');
    });
    
    safeAddEventListener('backToFormBtn3', 'click', function() {
        showSection('personalDetailsSection');
    });
    
    safeAddEventListener('backToEditBtn', 'click', function() {
        showSection('personalDetailsSection');
    });
    
    safeAddEventListener('startBuildingBtn', 'click', function() {
        showSection('personalDetailsSection');
        showNotification('Let\'s build your perfect resume!', 'success');
    });
    
    // Dark mode toggle
    safeAddEventListener('darkModeToggle', 'click', toggleDarkMode);
    
    // Auto-save toggle
    safeAddEventListener('autoSaveToggle', 'click', toggleAutoSave);
    
    // Photo upload
    safeAddEventListener('uploadPhotoBtn', 'click', function() {
        var input = document.getElementById('photoUpload');
        if (input) input.click();
    });
    
    safeAddEventListener('photoUpload', 'change', handlePhotoUpload);
    safeAddEventListener('removePhotoBtn', 'click', removePhoto);
    
    // Company logo upload
    safeAddEventListener('uploadCompanyLogoBtn', 'click', function() {
        var input = document.getElementById('companyLogoUpload');
        if (input) input.click();
    });
    
    safeAddEventListener('companyLogoUpload', 'change', handleCompanyLogoUpload);
    safeAddEventListener('removeCompanyLogoBtn', 'click', removeCompanyLogo);
    
    // Add buttons
    safeAddEventListener('addSkillBtn', 'click', addSkillField);
    safeAddEventListener('addExperienceBtn', 'click', addExperienceField);
    safeAddEventListener('addEducationBtn', 'click', addEducationField);
    safeAddEventListener('addProjectBtn', 'click', addProjectField);
    safeAddEventListener('addCertificationBtn', 'click', addCertificationField);
    safeAddEventListener('addLanguageBtn', 'click', addLanguageField);
    safeAddEventListener('addHobbyBtn', 'click', addHobbyField);
    
    // Action buttons
    safeAddEventListener('previewBtn', 'click', function() {
        collectFormData();
        renderResumePreview();
        showSection('previewSection');
    });
    
    safeAddEventListener('saveDataBtn', 'click', downloadBackup);
    safeAddEventListener('importDataBtn', 'click', function() {
        var input = document.getElementById('importFileInput');
        if (input) input.click();
    });
    
    safeAddEventListener('importFileInput', 'change', importBackup);
    
    // Preview actions
    safeAddEventListener('downloadPdfBtn', 'click', downloadPDF);
    safeAddEventListener('printResumeBtn', 'click', printResume);
    safeAddEventListener('changeThemeBtn', 'click', function() {
        showSection('themeGallerySection');
    });
    safeAddEventListener('shareResumeBtn', 'click', shareResume);
    safeAddEventListener('saveResumeBtn', 'click', function() {
        var modal = document.getElementById('saveModal');
        if (modal) modal.classList.add('active');
    });
    
    // Modal actions
    var closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(function(btn) {
        btn.addEventListener('click', closeModals);
    });
    
    safeAddEventListener('confirmSaveBtn', 'click', saveResume);
    safeAddEventListener('copyLinkBtn', 'click', copyShareLink);
    
    // Collapsible sections
    var headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(function(header) {
        header.addEventListener('click', function() {
            header.parentElement.classList.toggle('active');
        });
    });
    
    // Theme filters
    var filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterButtons.forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            filterThemes(btn.dataset.category);
        });
    });
    
    // Form inputs auto-save
    var inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(function(input) {
        input.addEventListener('input', debounce(function() {
            if (autoSaveEnabled) {
                collectFormData();
                saveToLocalStorage();
            }
        }, 500));
    });
    
    // AI Suggest buttons
    var aiButtons = document.querySelectorAll('.btn-ai');
    aiButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var targetId = btn.dataset.target;
            aiSuggest(targetId);
        });
    });
}

// Safe event listener helper
function safeAddEventListener(elementId, event, handler) {
    var element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(event, handler);
    }
}

// ===================================
// SECTION MANAGEMENT
// ===================================

function showSection(sectionId) {
    var sections = document.querySelectorAll('.section');
    sections.forEach(function(section) {
        section.classList.remove('active');
    });
    var targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// DARK MODE
// ===================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    var icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    }
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    var icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// ===================================
// AUTO-SAVE TOGGLE
// ===================================

function toggleAutoSave() {
    autoSaveEnabled = !autoSaveEnabled;
    var statusEl = document.getElementById('autoSaveStatus');
    if (statusEl) {
        statusEl.textContent = autoSaveEnabled ? 'ON' : 'OFF';
    }
    showNotification('Auto-save ' + (autoSaveEnabled ? 'enabled' : 'disabled'), 'success');
}

// ===================================
// PHOTO UPLOAD FUNCTIONALITY
// ===================================

function handlePhotoUpload(event) {
    var file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
    }
    
    var reader = new FileReader();
    
    reader.onload = function(e) {
        var dataURL = e.target.result;
        profilePhoto = dataURL;
        resumeData.photo = dataURL;
        
        var preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = '<img src="' + dataURL + '" alt="Profile Photo">';
            preview.classList.add('has-image');
        }
        
        var removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
        }
        
        if (autoSaveEnabled) {
            saveToLocalStorage();
        }
        
        showNotification('Photo uploaded successfully!', 'success');
        updatePreview();
    };
    
    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsDataURL(file);
}

function removePhoto() {
    profilePhoto = null;
    resumeData.photo = null;
    
    var preview = document.getElementById('photoPreview');
    if (preview) {
        preview.innerHTML = '<i class="fas fa-user-circle"></i><span>No photo selected</span>';
        preview.classList.remove('has-image');
    }
    
    var removeBtn = document.getElementById('removePhotoBtn');
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
    
    var input = document.getElementById('photoUpload');
    if (input) {
        input.value = '';
    }
    
    if (autoSaveEnabled) {
        saveToLocalStorage();
    }
    
    showNotification('Photo removed', 'success');
    updatePreview();
}

// ===================================
// COMPANY LOGO UPLOAD FUNCTIONALITY
// ===================================

function handleCompanyLogoUpload(event) {
    var file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Logo size should be less than 2MB', 'error');
        return;
    }
    
    var reader = new FileReader();
    
    reader.onload = function(e) {
        var dataURL = e.target.result;
        companyLogo = dataURL;
        resumeData.logo = dataURL;
        
        var preview = document.getElementById('companyLogoPreview');
        if (preview) {
            preview.innerHTML = '<img src="' + dataURL + '" alt="Company Logo">';
            preview.classList.add('has-image');
        }
        
        var removeBtn = document.getElementById('removeCompanyLogoBtn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
        }
        
        if (autoSaveEnabled) {
            saveToLocalStorage();
        }
        
        showNotification('Logo uploaded successfully!', 'success');
        updatePreview();
    };
    
    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsDataURL(file);
}

function removeCompanyLogo() {
    companyLogo = null;
    resumeData.logo = null;
    
    var preview = document.getElementById('companyLogoPreview');
    if (preview) {
        preview.innerHTML = '<i class="fas fa-building"></i><span>No logo selected</span>';
        preview.classList.remove('has-image');
    }
    
    var removeBtn = document.getElementById('removeCompanyLogoBtn');
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
    
    var input = document.getElementById('companyLogoUpload');
    if (input) {
        input.value = '';
    }
    
    if (autoSaveEnabled) {
        saveToLocalStorage();
    }
    
    showNotification('Logo removed', 'success');
    updatePreview();
}

// ===================================
// DYNAMIC FIELD MANAGEMENT
// ===================================

function addSkillField() {
    var container = document.getElementById('skillsList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Skill ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Skill Name</label>' +
        '<input type="text" class="skill-name" placeholder="e.g., JavaScript, Python, Management">' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function addExperienceField() {
    var container = document.getElementById('experienceList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Experience ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-row">' +
        '<div class="input-field">' +
        '<label>Company Name</label>' +
        '<input type="text" class="exp-company" placeholder="Company Name">' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Job Role</label>' +
        '<input type="text" class="exp-role" placeholder="Software Engineer">' +
        '</div>' +
        '</div>' +
        '<div class="input-row">' +
        '<div class="input-field">' +
        '<label>Duration</label>' +
        '<input type="text" class="exp-duration" placeholder="Jan 2020 - Present">' +
        '</div>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Description</label>' +
        '<textarea class="exp-description" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function addEducationField() {
    var container = document.getElementById('educationList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Education ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-row">' +
        '<div class="input-field">' +
        '<label>School/University</label>' +
        '<input type="text" class="edu-school" placeholder="University Name">' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Degree</label>' +
        '<input type="text" class="edu-degree" placeholder="Bachelor of Science">' +
        '</div>' +
        '</div>' +
        '<div class="input-row">' +
        '<div class="input-field">' +
        '<label>Year</label>' +
        '<input type="text" class="edu-year" placeholder="2016 - 2020">' +
        '</div>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Description</label>' +
        '<textarea class="edu-description" rows="2" placeholder="Additional details..."></textarea>' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function addProjectField() {
    var container = document.getElementById('projectsList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Project ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Project Title</label>' +
        '<input type="text" class="proj-title" placeholder="Project Name">' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Description</label>' +
        '<textarea class="proj-description" rows="3" placeholder="Describe the project..."></textarea>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Link (optional)</label>' +
        '<input type="url" class="proj-link" placeholder="https://github.com/...">' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function addCertificationField() {
    var container = document.getElementById('certificationsList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Certification ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-row">' +
        '<div class="input-field">' +
        '<label>Certification Name</label>' +
        '<input type="text" class="cert-name" placeholder="AWS Certified Developer">' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Issuer</label>' +
        '<input type="text" class="cert-issuer" placeholder="Amazon Web Services">' +
        '</div>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Year</label>' +
        '<input type="text" class="cert-year" placeholder="2023">' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function addLanguageField() {
    var container = document.getElementById('languagesList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Language ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-row">' +
        '<div class="input-field">' +
        '<label>Language</label>' +
        '<input type="text" class="lang-name" placeholder="English">' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Proficiency</label>' +
        '<select class="lang-level">' +
        '<option>Native</option>' +
        '<option>Fluent</option>' +
        '<option>Advanced</option>' +
        '<option>Intermediate</option>' +
        '<option>Basic</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function addHobbyField() {
    var container = document.getElementById('hobbiesList');
    if (!container) return;
    
    var id = Date.now();
    var html = '<div class="item-card" data-id="' + id + '">' +
        '<div class="item-card-header">' +
        '<h4>Hobby ' + (container.children.length + 1) + '</h4>' +
        '<button class="btn-remove" onclick="removeItem(this)">' +
        '<i class="fas fa-trash"></i> Remove' +
        '</button>' +
        '</div>' +
        '<div class="input-field">' +
        '<label>Hobby/Interest</label>' +
        '<input type="text" class="hobby-name" placeholder="Photography, Reading, etc.">' +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

function removeItem(button) {
    var card = button.closest('.item-card');
    if (card) {
        card.remove();
        collectFormData();
        saveToLocalStorage();
    }
}

// ===================================
// DATA COLLECTION
// ===================================

function collectFormData() {
    resumeData.personal = {
        fullName: getValueById('fullName'),
        jobTitle: getValueById('jobTitle'),
        phone: getValueById('phone'),
        email: getValueById('email'),
        linkedin: getValueById('linkedin'),
        website: getValueById('website'),
        address: getValueById('address'),
        profileSummary: getValueById('profileSummary')
    };
    
    resumeData.skills = [];
    var skillCards = document.querySelectorAll('#skillsList .item-card');
    skillCards.forEach(function(card) {
        var nameInput = card.querySelector('.skill-name');
        if (nameInput && nameInput.value) {
            resumeData.skills.push({ name: nameInput.value });
        }
    });
    
    resumeData.experience = [];
    var expCards = document.querySelectorAll('#experienceList .item-card');
    expCards.forEach(function(card) {
        var company = card.querySelector('.exp-company');
        var role = card.querySelector('.exp-role');
        var duration = card.querySelector('.exp-duration');
        var description = card.querySelector('.exp-description');
        
        if ((company && company.value) || (role && role.value)) {
            resumeData.experience.push({
                company: company ? company.value : '',
                role: role ? role.value : '',
                duration: duration ? duration.value : '',
                description: description ? description.value : ''
            });
        }
    });
    
    resumeData.education = [];
    var eduCards = document.querySelectorAll('#educationList .item-card');
    eduCards.forEach(function(card) {
        var school = card.querySelector('.edu-school');
        var degree = card.querySelector('.edu-degree');
        var year = card.querySelector('.edu-year');
        var description = card.querySelector('.edu-description');
        
        if ((school && school.value) || (degree && degree.value)) {
            resumeData.education.push({
                school: school ? school.value : '',
                degree: degree ? degree.value : '',
                year: year ? year.value : '',
                description: description ? description.value : ''
            });
        }
    });
    
    resumeData.projects = [];
    var projCards = document.querySelectorAll('#projectsList .item-card');
    projCards.forEach(function(card) {
        var title = card.querySelector('.proj-title');
        var description = card.querySelector('.proj-description');
        var link = card.querySelector('.proj-link');
        
        if (title && title.value) {
            resumeData.projects.push({
                title: title.value,
                description: description ? description.value : '',
                link: link ? link.value : ''
            });
        }
    });
    
    resumeData.certifications = [];
    var certCards = document.querySelectorAll('#certificationsList .item-card');
    certCards.forEach(function(card) {
        var name = card.querySelector('.cert-name');
        var issuer = card.querySelector('.cert-issuer');
        var year = card.querySelector('.cert-year');
        
        if (name && name.value) {
            resumeData.certifications.push({
                name: name.value,
                issuer: issuer ? issuer.value : '',
                year: year ? year.value : ''
            });
        }
    });
    
    resumeData.languages = [];
    var langCards = document.querySelectorAll('#languagesList .item-card');
    langCards.forEach(function(card) {
        var name = card.querySelector('.lang-name');
        var level = card.querySelector('.lang-level');
        
        if (name && name.value) {
            resumeData.languages.push({
                name: name.value,
                level: level ? level.value : 'Fluent'
            });
        }
    });
    
    resumeData.hobbies = [];
    var hobbyCards = document.querySelectorAll('#hobbiesList .item-card');
    hobbyCards.forEach(function(card) {
        var hobby = card.querySelector('.hobby-name');
        if (hobby && hobby.value) {
            resumeData.hobbies.push({ name: hobby.value });
        }
    });
}

function getValueById(id) {
    var element = document.getElementById(id);
    return element ? element.value : '';
}

// ===================================
// LOCAL STORAGE
// ===================================

function saveToLocalStorage() {
    try {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
        localStorage.setItem('currentTheme', currentTheme);
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        showNotification('Error saving data', 'error');
    }
}

function loadFromLocalStorage() {
    try {
        var saved = localStorage.getItem('resumeData');
        if (saved) {
            resumeData = JSON.parse(saved);
            populateForm();
        }
        
        var theme = localStorage.getItem('currentTheme');
        if (theme) {
            currentTheme = theme;
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        showNotification('Error loading saved data', 'error');
    }
}

function populateForm() {
    if (resumeData.personal) {
        setValueById('fullName', resumeData.personal.fullName);
        setValueById('jobTitle', resumeData.personal.jobTitle);
        setValueById('phone', resumeData.personal.phone);
        setValueById('email', resumeData.personal.email);
        setValueById('linkedin', resumeData.personal.linkedin);
        setValueById('website', resumeData.personal.website);
        setValueById('address', resumeData.personal.address);
        setValueById('profileSummary', resumeData.personal.profileSummary);
    }
    
    if (resumeData.photo) {
        profilePhoto = resumeData.photo;
        var preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = '<img src="' + resumeData.photo + '" alt="Profile Photo">';
            preview.classList.add('has-image');
        }
        var removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
        }
    }
    
    if (resumeData.logo) {
        companyLogo = resumeData.logo;
        var preview = document.getElementById('companyLogoPreview');
        if (preview) {
            preview.innerHTML = '<img src="' + resumeData.logo + '" alt="Company Logo">';
            preview.classList.add('has-image');
        }
        var removeBtn = document.getElementById('removeCompanyLogoBtn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
        }
    }
    
    clearContainers();
    
    if (resumeData.skills.length > 0) {
        resumeData.skills.forEach(function(skill, i) {
            addSkillField();
            var inputs = document.querySelectorAll('#skillsList .skill-name');
            if (inputs[i]) inputs[i].value = skill.name;
        });
    } else {
        addSkillField();
    }
    
    if (resumeData.experience.length > 0) {
        resumeData.experience.forEach(function(exp, i) {
            addExperienceField();
            var cards = document.querySelectorAll('#experienceList .item-card');
            var card = cards[i];
            if (card) {
                setCardValue(card, '.exp-company', exp.company);
                setCardValue(card, '.exp-role', exp.role);
                setCardValue(card, '.exp-duration', exp.duration);
                setCardValue(card, '.exp-description', exp.description);
            }
        });
    } else {
        addExperienceField();
    }
    
    if (resumeData.education.length > 0) {
        resumeData.education.forEach(function(edu, i) {
            addEducationField();
            var cards = document.querySelectorAll('#educationList .item-card');
            var card = cards[i];
            if (card) {
                setCardValue(card, '.edu-school', edu.school);
                setCardValue(card, '.edu-degree', edu.degree);
                setCardValue(card, '.edu-year', edu.year);
                setCardValue(card, '.edu-description', edu.description);
            }
        });
    } else {
        addEducationField();
    }
    
    populateSection('projects', addProjectField, [
        ['.proj-title', 'title'],
        ['.proj-description', 'description'],
        ['.proj-link', 'link']
    ]);
    
    populateSection('certifications', addCertificationField, [
        ['.cert-name', 'name'],
        ['.cert-issuer', 'issuer'],
        ['.cert-year', 'year']
    ]);
    
    populateSection('languages', addLanguageField, [
        ['.lang-name', 'name'],
        ['.lang-level', 'level']
    ]);
    
    populateSection('hobbies', addHobbyField, [
        ['.hobby-name', 'name']
    ]);
}

function clearContainers() {
    var containers = [
        'skillsList', 'experienceList', 'educationList', 
        'projectsList', 'certificationsList', 'languagesList', 'hobbiesList'
    ];
    containers.forEach(function(id) {
        var container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });
}

function setValueById(id, value) {
    var element = document.getElementById(id);
    if (element) {
        element.value = value || '';
    }
}

function setCardValue(card, selector, value) {
    var element = card.querySelector(selector);
    if (element) {
        element.value = value || '';
    }
}

function populateSection(sectionName, addFunction, fieldMappings) {
    var data = resumeData[sectionName];
    if (data && data.length > 0) {
        data.forEach(function(item, i) {
            addFunction();
            var listId = sectionName + 'List';
            var cards = document.querySelectorAll('#' + listId + ' .item-card');
            var card = cards[i];
            if (card) {
                fieldMappings.forEach(function(mapping) {
                    setCardValue(card, mapping[0], item[mapping[1]]);
                });
            }
        });
    } else {
        addFunction();
    }
}

// ===================================
// THEME GENERATION
// ===================================

function generateThemes() {
    var gallery = document.getElementById('themeGallery');
    if (!gallery) return;
    
    var themes = [
        { name: 'Classic Minimal', category: 'minimal', id: 'minimal' },
        { name: 'Professional Blue', category: 'professional', id: 'professional-blue' },
        { name: 'Modern Gradient', category: 'modern', id: 'modern-gradient' },
        { name: 'Creative Bold', category: 'creative', id: 'creative-bold' },
        { name: 'Corporate Formal', category: 'corporate', id: 'corporate-formal' },
        { name: 'Minimalist White', category: 'minimal', id: 'minimal-white' },
        { name: 'Tech Savvy', category: 'modern', id: 'tech-savvy' },
        { name: 'Executive Suite', category: 'professional', id: 'executive' },
        { name: 'Artistic Flair', category: 'creative', id: 'artistic' },
        { name: 'Business Pro', category: 'corporate', id: 'business-pro' }
    ];
    
    for (var i = 11; i <= 50; i++) {
        themes.push({
            name: 'Theme ' + i,
            category: ['minimal', 'professional', 'modern', 'creative', 'corporate'][(i - 11) % 5],
            id: 'theme-' + i
        });
    }
    
    themes.forEach(function(theme) {
        var card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.category = theme.category;
        card.dataset.themeId = theme.id;
        card.innerHTML = '<div class="theme-preview">' +
            '<i class="fas fa-file-alt"></i>' +
            '</div>' +
            '<h4>' + theme.name + '</h4>' +
            '<p>' + theme.category.charAt(0).toUpperCase() + theme.category.slice(1) + '</p>';
        
        card.addEventListener('click', function() {
            selectTheme(theme.id, card);
        });
        gallery.appendChild(card);
    });
}

function selectTheme(themeId, cardElement) {
    var cards = document.querySelectorAll('.theme-card');
    cards.forEach(function(c) {
        c.classList.remove('selected');
    });
    cardElement.classList.add('selected');
    currentTheme = themeId;
    saveToLocalStorage();
    updatePreview();
    showNotification('Theme selected!', 'success');
}

function filterThemes(category) {
    var cards = document.querySelectorAll('.theme-card');
    cards.forEach(function(card) {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function updatePreview() {
    var preview = document.getElementById('livePreviewFrame');
    if (preview) {
        preview.innerHTML = generateResumeHTML();
    }
}

// ===================================
// RESUME PREVIEW & RENDERING
// ===================================

function renderResumePreview() {
    var container = document.getElementById('resumePreview');
    if (container) {
        container.innerHTML = generateResumeHTML();
    }
}

function generateResumeHTML() {
    var data = resumeData;
    var p = data.personal || {};
    var hasPhoto = data.photo;
    var hasLogo = data.logo;
    
    var html = '<div class="resume-theme-minimal">';
    
    html += '<div class="resume-header ' + (hasPhoto ? 'with-photo' : '') + ' ' + (hasLogo ? 'with-logo' : '') + '">';
    
    if (hasPhoto) {
        html += '<img src="' + data.photo + '" alt="Profile Photo" class="resume-photo">';
    }
    if (hasLogo) {
        html += '<img src="' + data.logo + '" alt="Company Logo" class="resume-logo">';
    }
    
    html += '<div class="resume-header-content">';
    html += '<h1>' + (p.fullName || 'Your Name') + '</h1>';
    html += '<h2>' + (p.jobTitle || 'Your Job Title') + '</h2>';
    html += '<div class="contact-info">';
    if (p.phone) html += '<span><i class="fas fa-phone"></i> ' + p.phone + '</span>';
    if (p.email) html += '<span><i class="fas fa-envelope"></i> ' + p.email + '</span>';
    if (p.linkedin) html += '<span><i class="fab fa-linkedin"></i> LinkedIn</span>';
    if (p.website) html += '<span><i class="fas fa-globe"></i> Portfolio</span>';
    if (p.address) html += '<span><i class="fas fa-map-marker-alt"></i> ' + p.address + '</span>';
    html += '</div></div></div>';
    
    if (p.profileSummary) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Professional Summary</h3>';
        html += '<p>' + p.profileSummary + '</p>';
        html += '</div>';
    }
    
    if (data.skills && data.skills.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Skills</h3>';
        html += '<div class="skills-list">';
        data.skills.forEach(function(s) {
            html += '<span class="skill-tag">' + s.name + '</span>';
        });
        html += '</div></div>';
    }
    
    if (data.experience && data.experience.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Work Experience</h3>';
        data.experience.forEach(function(exp) {
            html += '<div class="resume-item">';
            html += '<h4>' + exp.role + ' - ' + exp.company + '</h4>';
            html += '<p class="resume-item-meta">' + exp.duration + '</p>';
            html += '<p>' + exp.description + '</p>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    if (data.education && data.education.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Education</h3>';
        data.education.forEach(function(edu) {
            html += '<div class="resume-item">';
            html += '<h4>' + edu.degree + '</h4>';
            html += '<p class="resume-item-meta">' + edu.school + ' | ' + edu.year + '</p>';
            if (edu.description) html += '<p>' + edu.description + '</p>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    if (data.projects && data.projects.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Projects</h3>';
        data.projects.forEach(function(proj) {
            html += '<div class="resume-item">';
            html += '<h4>' + proj.title + '</h4>';
            html += '<p>' + proj.description + '</p>';
            if (proj.link) html += '<p class="resume-item-meta"><a href="' + proj.link + '" target="_blank">' + proj.link + '</a></p>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    if (data.certifications && data.certifications.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Certifications</h3>';
        data.certifications.forEach(function(cert) {
            html += '<div class="resume-item">';
            html += '<h4>' + cert.name + '</h4>';
            html += '<p class="resume-item-meta">' + cert.issuer + ' | ' + cert.year + '</p>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    if (data.languages && data.languages.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Languages</h3>';
        html += '<div class="skills-list">';
        data.languages.forEach(function(lang) {
            html += '<span class="skill-tag">' + lang.name + ' (' + lang.level + ')</span>';
        });
        html += '</div></div>';
    }
    
    if (data.hobbies && data.hobbies.length > 0) {
        html += '<div class="resume-section">';
        html += '<h3 class="resume-section-title">Interests</h3>';
        html += '<div class="skills-list">';
        data.hobbies.forEach(function(hobby) {
            html += '<span class="skill-tag">' + hobby.name + '</span>';
        });
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}

// ===================================
// PDF EXPORT
// ===================================

function downloadPDF() {
    var element = document.getElementById('resumePreview');
    if (!element) {
        showNotification('Error: Resume preview not found', 'error');
        return;
    }
    
    var opt = {
        margin: 0.5,
        filename: (resumeData.personal.fullName || 'Resume') + '_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    showNotification('Generating PDF... Please wait', 'success');
    
    try {
        html2pdf().set(opt).from(element).save().then(function() {
            showNotification('PDF downloaded successfully! 100% Watermark-Free', 'success');
        }).catch(function(error) {
            console.error('PDF generation error:', error);
            showNotification('Error generating PDF. Please try again.', 'error');
        });
    } catch (e) {
        console.error('PDF error:', e);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// ===================================
// PRINT
// ===================================

function printResume() {
    window.print();
}

// ===================================
// SHARE
// ===================================

function shareResume() {
    var modal = document.getElementById('shareModal');
    if (modal) {
        var link = 'https://resumefy.com/view/' + Date.now();
        var input = document.getElementById('shareLink');
        if (input) {
            input.value = link;
        }
        modal.classList.add('active');
    }
}

function copyShareLink() {
    var input = document.getElementById('shareLink');
    if (input) {
        input.select();
        document.execCommand('copy');
        showNotification('Link copied to clipboard!', 'success');
    }
}

// ===================================
// SAVE & LOAD RESUMES
// ===================================

function saveResume() {
    var nameInput = document.getElementById('resumeName');
    if (!nameInput || !nameInput.value) {
        showNotification('Please enter a resume name', 'error');
        return;
    }
    
    var name = nameInput.value;
    collectFormData();
    
    try {
        var savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
        savedResumes.push({
            name: name,
            data: resumeData,
            theme: currentTheme,
            date: new Date().toISOString()
        });
        localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
        
        closeModals();
        showNotification('Resume "' + name + '" saved successfully!', 'success');
    } catch (e) {
        console.error('Save error:', e);
        showNotification('Error saving resume', 'error');
    }
}

function loadSavedResumes() {
    var container = document.getElementById('savedResumesList');
    if (!container) return;
    
    try {
        var savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
        
        if (savedResumes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No saved resumes yet. Create and save your first resume!</p>';
            return;
        }
        
        var html = '';
        savedResumes.forEach(function(resume, index) {
            html += '<div class="saved-resume-card">';
            html += '<h3>' + resume.name + '</h3>';
            html += '<p>Saved on ' + new Date(resume.date).toLocaleDateString() + '</p>';
            html += '<div class="saved-resume-actions">';
            html += '<button class="btn-primary" onclick="loadResume(' + index + ')">';
            html += '<i class="fas fa-folder-open"></i> Load';
            html += '</button>';
            html += '<button class="btn-remove" onclick="deleteResume(' + index + ')">';
            html += '<i class="fas fa-trash"></i> Delete';
            html += '</button>';
            html += '</div></div>';
        });
        container.innerHTML = html;
    } catch (e) {
        console.error('Load resumes error:', e);
        showNotification('Error loading saved resumes', 'error');
    }
}

function loadResume(index) {
    try {
        var savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
        var resume = savedResumes[index];
        if (resume) {
            resumeData = resume.data;
            currentTheme = resume.theme;
            populateForm();
            saveToLocalStorage();
            showSection('personalDetailsSection');
            showNotification('Resume loaded successfully!', 'success');
        }
    } catch (e) {
        console.error('Load resume error:', e);
        showNotification('Error loading resume', 'error');
    }
}

function deleteResume(index) {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
        var savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
        savedResumes.splice(index, 1);
        localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
        loadSavedResumes();
        showNotification('Resume deleted', 'success');
    } catch (e) {
        console.error('Delete error:', e);
        showNotification('Error deleting resume', 'error');
    }
}

// ===================================
// BACKUP & IMPORT
// ===================================

function downloadBackup() {
    collectFormData();
    try {
        var dataStr = JSON.stringify(resumeData, null, 2);
        var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        var exportFileDefaultName = 'resumefy_backup_' + Date.now() + '.json';
        
        var linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        showNotification('Backup downloaded!', 'success');
    } catch (e) {
        console.error('Backup error:', e);
        showNotification('Error creating backup', 'error');
    }
}

function importBackup(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            resumeData = JSON.parse(e.target.result);
            populateForm();
            saveToLocalStorage();
            showNotification('Data imported successfully!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

// ===================================
// AI SUGGESTIONS
// ===================================

function aiSuggest(targetId) {
    var suggestions = {
        profileSummary: 'Experienced professional with a proven track record of delivering exceptional results. Skilled in leadership, problem-solving, and innovative thinking. Passionate about driving growth and achieving organizational goals through strategic planning and execution.'
    };
    
    var target = document.getElementById(targetId);
    if (target && suggestions[targetId]) {
        target.value = suggestions[targetId];
        collectFormData();
        saveToLocalStorage();
        showNotification('AI suggestion applied! Feel free to customize it.', 'success');
    } else {
        showNotification('AI suggestions coming soon!', 'success');
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function showNotification(message, type) {
    var toast = document.getElementById('notificationToast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'notification-toast ' + type + ' show';
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }
}

function closeModals() {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        modal.classList.remove('active');
    });
}

function resetForm() {
    resumeData = {
        personal: {},
        photo: null,
        logo: null,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
        hobbies: []
    };
    profilePhoto = null;
    companyLogo = null;
    
    var inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
        if (input.type !== 'file') {
            input.value = '';
        }
    });
    
    var photoPreview = document.getElementById('photoPreview');
    if (photoPreview) {
        photoPreview.innerHTML = '<i class="fas fa-user-circle"></i><span>No photo selected</span>';
        photoPreview.classList.remove('has-image');
    }
    var photoBtn = document.getElementById('removePhotoBtn');
    if (photoBtn) photoBtn.style.display = 'none';
    
    var logoPreview = document.getElementById('companyLogoPreview');
    if (logoPreview) {
        logoPreview.innerHTML = '<i class="fas fa-building"></i><span>No logo selected</span>';
        logoPreview.classList.remove('has-image');
    }
    var logoBtn = document.getElementById('removeCompanyLogoBtn');
    if (logoBtn) logoBtn.style.display = 'none';
    
    populateForm();
    saveToLocalStorage();
}

function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
        var context = this;
        var args = arguments;
        var later = function() {
            clearTimeout(timeout);
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// MODAL CLICK OUTSIDE TO CLOSE
// ===================================

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});
