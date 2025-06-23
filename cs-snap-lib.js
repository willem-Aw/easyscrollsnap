/**
 * SnapScroll
 * 
 * A lightweight, responsive, and customizable horizontal scroll snapping library.
 * 
 * Features:
 * - Horizontal scroll snapping for any container.
 * - Configurable number of items to show and scroll.
 * - Navigation arrows and pagination dots.
 * - Responsive breakpoints for different screen sizes.
 * - Mouse and touch drag support.
 * 
 * @example
 * // Initialize with a selector and options
 * const snap = new SnapScroll('.my-scroll-container', {
 *   itemsToShow: 3,
 *   itemsToScroll: 2,
 *   gap: 16,
 *   navigation: true,
 *   dots: true,
 *   responsive: {
 *     768: { itemsToShow: 2, itemsToScroll: 1 },
 *     1024: { itemsToShow: 4, itemsToScroll: 2 }
 *   }
 * });
 * 
 * @class
 * @param {HTMLElement|string} container - The container element or selector.
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.itemsToShow=1] - Number of items visible at once.
 * @param {number} [options.itemsToScroll=1] - Number of items to scroll per navigation.
 * @param {number} [options.snapDuration=300] - Duration of snap animation (ms).
 * @param {number} [options.gap=20] - Gap (px) between items.
 * @param {boolean} [options.navigation=true] - Show navigation arrows.
 * @param {boolean} [options.dots=false] - Show pagination dots.
 * @param {Object} [options.responsive=null] - Responsive breakpoints, keyed by min width.
 * 
 * @method update(config) - Update options and refresh layout.
 * @method prev() - Scroll to previous set of items.
 * @method next() - Scroll to next set of items.
 * @method scrollTo(index) - Scroll to a specific group of items.
 * @method destroy() - Remove all event listeners and DOM changes.
 */
class SnapScroll {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        // Default options
        this.defaults = {
            itemsToShow: 1,
            itemsToScroll: 1,
            snapDuration: 300,
            gap: 20,
            navigation: true,
            dots: false,
            responsive: null,
        };

        // Merge options
        this.options = { ...this.defaults, ...options };
        console.log(this.options);
        this.currentBreakpoint = null;
        this.items = Array.from(this.container.children);
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;

        this.init();
    }

    init() {
        this.setupStyles();
        this.setupContainer();
        this.setupItems();
        this.setupEvents();

        if (this.options.navigation) this.addNavigation();
        if (this.options.dots) this.addDots();
        if (this.options.responsive) this.setupResponsive();
        // if (this.options.)

        this.update();
    }

    setupStyles() {
        if (!document.getElementById('snap-scroll-styles')) {
            const style = document.createElement('style');
            style.id = 'snap-scroll-styles';
            style.textContent = `
        .snap-scroll-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          position: relative;
        }
        .snap-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .snap-scroll-item {
          scroll-snap-align: start;
          flex: 0 0 auto;
          position: relative;
        }
        .snap-scroll-nav {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }
        .snap-scroll-btn {
          background: #333;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .snap-scroll-btn:hover {
          background: #555;
        }
        .snap-scroll-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        .snap-scroll-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ccc;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .snap-scroll-dot.active {
          background: #333;
        }
      `;
            document.head.appendChild(style);
        }
    }

    setupContainer() {
        this.container.classList.add('snap-scroll-container');
        this.container.style.gap = `${this.options.gap}px`;
    }

    setupItems() {
        this.items.forEach(item => {
            item.classList.add('snap-scroll-item');
        });
    }

    setupEvents() {
        // Mouse/touch events for dragging
        this.container.addEventListener('mousedown', this.startDrag.bind(this));
        this.container.addEventListener('touchstart', this.startDrag.bind(this), { passive: true });

        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });

        document.addEventListener('mouseup', this.endDrag.bind(this));
        document.addEventListener('touchend', this.endDrag.bind(this));

        // Resize observer for responsive updates
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);
    }

    startDrag(e) {
        this.isDragging = true;
        this.startX = e.pageX || e.touches[0].pageX;
        this.scrollLeft = this.container.scrollLeft;
        this.container.style.scrollBehavior = 'auto';
        this.container.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const x = e.pageX || e.touches[0].pageX;
        const walk = (x - this.startX) * 2;
        this.container.scrollLeft = this.scrollLeft - walk;
    }

    endDrag() {
        this.isDragging = false;
        this.container.style.scrollBehavior = 'smooth';
        this.container.style.cursor = 'grab';
        this.snapToNearest();
    }

    snapToNearest() {
        const itemWidth = this.getItemWidth();
        const scrollPos = this.container.scrollLeft;
        const activeIndex = Math.round(scrollPos / (itemWidth + this.options.gap));
        this.scrollTo(activeIndex);
    }

    getItemWidth() {
        return this.container.offsetWidth / this.getItemsToShow() - this.options.gap;
    }

    getItemsToShow() {
        if (!this.options.responsive) return this.options.itemsToShow;

        const containerWidth = this.container.offsetWidth;
        let activeBreakpoint = null;
        let itemsToShow = this.options.itemsToShow;

        // Get sorted breakpoints (largest to smallest)
        const sortedBreakpoints = Object.keys(this.options.responsive)
            .map(Number)
            .sort((a, b) => b - a); // Descending order

        // Find the first matching breakpoint
        for (const breakpoint of sortedBreakpoints) {
            if (containerWidth >= breakpoint) {
                activeBreakpoint = breakpoint;
                const config = this.options.responsive[breakpoint];
                itemsToShow = config.itemsToShow || itemsToShow;
                break;
            }
        }

        return itemsToShow;
    }
    /* 
        getItemsToScroll() {
            if (!this.options.responsive) return this.options.itemsToScroll;
    
            const containerWidth = this.container.offsetWidth;
            let activeBreakpoint = null;
            let itemsToScroll = this.options.itemsToScroll;
    
            // Get sorted breakpoints (largest to smallest)
            const sortedBreakpoints = Object.keys(this.options.responsive)
                .map(Number)
                .sort((a, b) => b - a); // Descending order
    
            // Find the first matching breakpoint
            for (const breakpoint of sortedBreakpoints) {
                if (containerWidth >= breakpoint) {
                    // console.log("containerWidth : " + containerWidth);
                    // console.log("breakpoint : " + breakpoint);
                    activeBreakpoint = breakpoint;
                    const config = this.options.responsive[breakpoint];
                    itemsToScroll = config.itemsToScroll || itemsToScroll;
                    break;
                }
            }
    
            console.log("itemsToScroll : " + itemsToScroll);
    
            return itemsToScroll;
        } */
    getItemsToScroll() {
        if (!this.options.responsive) return this.options.itemsToScroll;

        const containerWidth = this.container.offsetWidth;
        let itemsToScroll = this.options.itemsToScroll; // Default fallback

        // Get sorted breakpoints (ascending order - smallest first)
        const sortedBreakpoints = Object.keys(this.options.responsive)
            .map(Number)
            .sort((a, b) => a - b);

        // Find the largest matching breakpoint
        let activeBreakpoint = null;
        for (const breakpoint of sortedBreakpoints) {
            if (containerWidth >= breakpoint) {
                activeBreakpoint = breakpoint;
            } else {
                break; // Since sorted ascending, we can break when we pass the width
            }
        }

        // If we found a matching breakpoint, get its config
        if (activeBreakpoint !== null) {
            const config = this.options.responsive[activeBreakpoint];
            itemsToScroll = config.itemsToScroll !== undefined
                ? config.itemsToScroll
                : itemsToScroll;
        }

        console.log(`Matched breakpoint: ${activeBreakpoint}, itemsToScroll: ${itemsToScroll}`);

        return itemsToScroll;
    }

    update(config = null) {
        if (config) {
            this.options = { ...this.options, ...config };
        }

        const itemsToShow = this.getItemsToShow();
        const itemWidth = this.getItemWidth();

        this.items.forEach(item => {
            item.style.width = `${itemWidth}px`;
        });

        if (this.dotsContainer) {
            this.updateDots();
        }
    }

    addNavigation() {
        this.navContainer = document.createElement('div');
        this.navContainer.className = 'snap-scroll-nav';

        this.prevButton = document.createElement('button');
        this.prevButton.className = 'snap-scroll-btn snap-scroll-prev';
        this.prevButton.innerHTML = '&larr;';
        this.prevButton.addEventListener('click', () => this.prev());

        this.nextButton = document.createElement('button');
        this.nextButton.className = 'snap-scroll-btn snap-scroll-next';
        this.nextButton.innerHTML = '&rarr;';
        this.nextButton.addEventListener('click', () => this.next());

        this.navContainer.appendChild(this.prevButton);
        this.navContainer.appendChild(this.nextButton);

        this.container.parentNode.insertBefore(this.navContainer, this.container.nextSibling);
    }

    addDots() {
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'snap-scroll-dots';

        const itemCount = Math.ceil(this.items.length / this.getItemsToShow());

        for (let i = 0; i < itemCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'snap-scroll-dot';
            if (i === 0) dot.classList.add('active');

            dot.addEventListener('click', () => {
                this.scrollTo(i);
            });

            this.dotsContainer.appendChild(dot);
        }

        this.container.parentNode.insertBefore(this.dotsContainer, this.container.nextSibling);

        this.container.addEventListener('scroll', () => {
            this.updateActiveDot();
        });
    }

    updateDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        const itemCount = Math.ceil(this.items.length / this.getItemsToShow());

        for (let i = 0; i < itemCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'snap-scroll-dot';

            dot.addEventListener('click', () => {
                this.scrollTo(i);
            });

            this.dotsContainer.appendChild(dot);
        }

        this.updateActiveDot();
    }

    updateActiveDot() {
        if (!this.dotsContainer) return;

        const dots = this.dotsContainer.querySelectorAll('.snap-scroll-dot');
        const itemWidth = this.getItemWidth() + this.options.gap;
        const activeIndex = Math.round(this.container.scrollLeft / (itemWidth * this.getItemsToShow()));

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    setupResponsive() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const prevItemsToShow = this.currentBreakpoint?.itemsToShow || this.options.itemsToShow;
        const prevItemsToScroll = this.currentBreakpoint?.itemsToScroll || this.options.itemsToScroll;

        const currentItemsToShow = this.getItemsToShow();
        const currentItemsToScroll = this.getItemsToScroll();

        // Only update if something actually changed
        if (currentItemsToShow !== prevItemsToShow || currentItemsToScroll !== prevItemsToScroll) {
            this.currentBreakpoint = {
                itemsToShow: currentItemsToShow,
                itemsToScroll: currentItemsToScroll
            };
            console.log(this.getItemsToScroll());
            this.update();

            // Maintain scroll position relative to current item
            const itemWidth = this.getItemWidth() + this.options.gap;
            const currentIndex = Math.round(this.container.scrollLeft / (itemWidth * prevItemsToShow));
            const newScrollPos = currentIndex * (itemWidth * currentItemsToShow);

            // Temporarily disable smooth scrolling for this adjustment
            const originalBehavior = this.container.style.scrollBehavior;
            this.container.style.scrollBehavior = 'auto';
            this.container.scrollLeft = newScrollPos;
            this.container.style.scrollBehavior = originalBehavior;
        }
    }
    /* 
        prev() {
            const currentPos = this.container.scrollLeft;
            const itemWidth = this.getItemWidth() + this.options.gap;
            const scrollAmount = itemWidth * this.options.itemsToScroll;
    
            this.container.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        }
    
        next() {
            const currentPos = this.container.scrollLeft;
            const itemWidth = this.getItemWidth() + this.options.gap;
            const scrollAmount = itemWidth * this.options.itemsToScroll;
    
            this.container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        } */
    prev() {
        const itemWidth = this.getItemWidth() + this.options.gap;
        const scrollAmount = itemWidth * this.getItemsToScroll();

        this.container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }

    next() {
        const itemWidth = this.getItemWidth() + this.options.gap;
        const scrollAmount = itemWidth * this.getItemsToScroll();

        this.container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    scrollTo(index) {
        const itemWidth = this.getItemWidth() + this.options.gap;
        const scrollAmount = itemWidth * this.getItemsToShow() * index;

        this.container.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.update();
    }

    destroy() {
        // Clean up event listeners and elements
        this.container.classList.remove('snap-scroll-container');
        this.items.forEach(item => item.classList.remove('snap-scroll-item'));

        if (this.navContainer) this.navContainer.remove();
        if (this.dotsContainer) this.dotsContainer.remove();

        this.resizeObserver.disconnect();
    }
}

// Initialize with factory function
window.snapScroll = function (selector, options) {
    return new SnapScroll(selector, options);
};