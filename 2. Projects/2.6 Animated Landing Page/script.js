/*
  PROJECT 2.6 — script.js
  ========================

  TASK 1 — Scroll-triggered animations (IntersectionObserver)
  ──────────────────────────────────────────────────────────────
  In your HTML, every element that should animate in on scroll
  has a [data-animate] attribute. Your job here is to watch those
  elements and add the "visible" class when they enter the viewport.

  How to do it:
    1. Create an IntersectionObserver. The callback receives a list of
       "entries" — objects describing whether each observed element is
       currently visible.

    2. Inside the callback, loop through entries. If entry.isIntersecting
       is true, the element has entered the viewport:
         a. Add the "visible" class to entry.target
         b. Stop observing that element (observer.unobserve) so the
            animation doesn't replay every time you scroll back

    3. To stagger multiple cards animating at the same time, use
       setTimeout(() => ..., index * 100) around the classList.add call.
       The index comes from the forEach loop index.

    4. The observer options object has a "threshold" property — a value
       between 0 and 1 representing how much of the element must be
       visible before the callback fires. Try 0.15 (15% visible).

    5. After creating the observer, select all [data-animate] elements
       with querySelectorAll and call observer.observe() on each one.

  Hint:
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // add visible class here, optionally with a setTimeout delay
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));


  TASK 2 — Sticky navbar style change on scroll (stretch goal)
  ──────────────────────────────────────────────────────────────
  If you've built a navbar, make it change its appearance once the
  user has scrolled past the hero section.

  How to do it:
    1. Listen for the "scroll" event on the window.
    2. Check window.scrollY — the number of pixels scrolled.
    3. If scrollY is greater than, say, window.innerHeight (one screen
       height), add a CSS class (e.g. "scrolled") to the navbar element.
    4. Remove that class if they scroll back up.
    5. In your CSS, style .navbar.scrolled with a solid background,
       backdrop-filter: blur(), and a border-bottom.

  Hint:
    const nav = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > window.innerHeight);
    });


  TASK 3 — Animated counter (stretch goal)
  ──────────────────────────────────────────
  If you've built a stats section with numbers (e.g. "50,000 users"),
  animate them counting up from 0 to the target value when they scroll
  into view.

  How to do it:
    1. Store the target number in a data attribute on the element:
         <p class="stat" data-target="50000">0</p>
    2. When an IntersectionObserver fires on that element, read
       data-target with el.dataset.target.
    3. Use setInterval (or requestAnimationFrame) to increment the
       displayed number from 0 to the target over ~1.5 seconds.
    4. Format large numbers with toLocaleString() to add commas:
         el.textContent = Math.floor(current).toLocaleString();
*/
