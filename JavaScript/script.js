class ProfessionalTabMenu {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.tabIndicator = document.querySelector('.tab-indicator');
        this.tabWrapper = document.querySelector('.tab-wrapper');

        this.init();
    }

    init() {
        // Set initial indicator position
        this.updateIndicator(document.querySelector('.tab-button.active'));

        // Add event listeners
        this.tabButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => this.handleTabClick(e, button));
            button.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            const activeButton = document.querySelector('.tab-button.active');
            this.updateIndicator(activeButton);
        }, 250));
    }

    handleTabClick(event, clickedButton) {
        if (clickedButton.classList.contains('active')) return;

        // Add loading state
        this.setLoadingState(clickedButton, true);

        // Simulate loading delay for smooth UX
        setTimeout(() => {
            this.switchTab(clickedButton);
            this.setLoadingState(clickedButton, false);
        }, 200);
    }

    handleKeyDown(event, index) {
        let newIndex = index;

        switch (event.key) {
            case 'ArrowLeft':
                newIndex = index > 0 ? index - 1 : this.tabButtons.length - 1;
                break;
            case 'ArrowRight':
                newIndex = index < this.tabButtons.length - 1 ? index + 1 : 0;
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = this.tabButtons.length - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleTabClick(event, this.tabButtons[index]);
                return;
            default:
                return;
        }

        event.preventDefault();
        this.tabButtons[newIndex].focus();
        this.handleTabClick(event, this.tabButtons[newIndex]);
    }

    switchTab(targetButton) {
        // Remove active states
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        // Add active state to target
        targetButton.classList.add('active');

        // Show corresponding content
        const targetContent = document.getElementById(targetButton.dataset.tab);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Update indicator position
        this.updateIndicator(targetButton);

        // Analytics tracking (optional)
        this.trackTabSwitch(targetButton.dataset.tab);
    }

    updateIndicator(activeButton) {
        if (!activeButton) return;

        const buttonRect = activeButton.getBoundingClientRect();
        const wrapperRect = this.tabWrapper.getBoundingClientRect();

        const left = buttonRect.left - wrapperRect.left - 4;
        const width = buttonRect.width;

        this.tabIndicator.style.left = `${left}px`;
        this.tabIndicator.style.width = `${width}px`;
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
        } else {
            button.classList.remove('loading');
        }
    }

    trackTabSwitch(tabName) {
        // Analytics integration
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tab_switch', {
                'tab_name': tabName,
                'timestamp': new Date().toISOString()
            });
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalTabMenu();
    initMobileMenu();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Prevent scrolling when menu is open
            if (document.body.classList.contains('menu-open')) {
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';
            } else {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            
            // Smooth scroll to section
            const href = link.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    setTimeout(() => {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 968 && mobileNav.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
    });
}

// Add touch gesture support for mobile
if ('ontouchstart' in window) {
    let startX = 0;
    let currentTab = 0;

    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentTab = Array.from(document.querySelectorAll('.tab-button')).findIndex(btn =>
            btn.classList.contains('active')
        );
    });

    document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            const buttons = document.querySelectorAll('.tab-button');
            let newIndex;

            if (diff > 0 && currentTab < buttons.length - 1) {
                // Swipe left - next tab
                newIndex = currentTab + 1;
            } else if (diff < 0 && currentTab > 0) {
                // Swipe right - previous tab
                newIndex = currentTab - 1;
            }

            if (newIndex !== undefined) {
                buttons[newIndex].click();
            }
        }
    });
}

// Debug function
function updateDebug(message) {
    const debugElement = document.getElementById('debug-content');
    if (debugElement) {
        debugElement.innerHTML += '<br>' + new Date().toLocaleTimeString() + ': ' + message;
    }
    console.log(message);
}

// Load More Function
function loadMoreItems() {
    updateDebug('Load More button clicked!');

    const hiddenCards = document.querySelectorAll('.food-card.hidden-item');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    updateDebug(`Found ${hiddenCards.length} hidden cards`);

    if (hiddenCards.length === 0) {
        updateDebug('No more items to show');
        loadMoreBtn.style.display = 'none';
        return;
    }

    // Add loading state
    loadMoreBtn.classList.add('loading');
    loadMoreBtn.textContent = '';
    updateDebug('Loading state activated');

    // Show items after delay
    setTimeout(() => {
        let itemsShown = 0;
        const itemsToShow = 3;

        hiddenCards.forEach((card, index) => {
            if (itemsShown < itemsToShow) {
                setTimeout(() => {
                    card.classList.remove('hidden-item');
                    card.classList.add('fade-in');
                    updateDebug(`Showing card ${itemsShown + 1}`);
                }, index * 200);
                itemsShown++;
            }
        });

        // Remove loading state
        setTimeout(() => {
            loadMoreBtn.classList.remove('loading');
            loadMoreBtn.textContent = 'Load More Dishes';

            // Check if more items exist
            const remainingHidden = document.querySelectorAll('.food-card.hidden-item');
            if (remainingHidden.length === 0) {
                loadMoreBtn.style.display = 'none';
                updateDebug('All items shown, hiding button');
            }
        }, 800);

    }, 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    updateDebug('Page loaded successfully');

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const hiddenCards = document.querySelectorAll('.food-card.hidden-item');

    updateDebug(`Button exists: ${loadMoreBtn ? 'YES' : 'NO'}`);
    updateDebug(`Hidden cards count: ${hiddenCards.length}`);
    updateDebug(`Button visible: ${loadMoreBtn && loadMoreBtn.offsetWidth > 0 ? 'YES' : 'NO'}`);

    if (hiddenCards.length === 0) {
        loadMoreBtn.style.display = 'none';
        updateDebug('No hidden cards found, hiding button');
    }
});