// Slide names also power the menu, shortcuts, and progress display.
const slides = [...document.querySelectorAll('.slide')];
const menuTrigger = document.querySelector('#menuTrigger');
const menu = document.querySelector('#slideMenu');
const backdrop = document.querySelector('#menuBackdrop');
const menuList = document.querySelector('#menuList');
const currentNumber = document.querySelector('#currentNumber');
const progress = document.querySelector('#topProgress');
const progressFill = document.querySelector('#progressFill');
let currentSlide = 0;
let touchStart = null;

// Build the slide picker from the deck sections.
slides.forEach((slide, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'menu-item';
  button.setAttribute('aria-current', String(index === 0));
  button.innerHTML = `<span class="menu-number">${String(index + 1).padStart(2, '0')}</span><span class="menu-thumb" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="menu-title">${slide.dataset.title}</span><small>${index + 1} <kbd>${index + 1}</kbd></small>`;
  button.addEventListener('click', () => goToSlide(index));
  menuList.append(button);
});
const menuItems = [...menuList.querySelectorAll('.menu-item')];

function goToSlide(index) {
  const next = (index + slides.length) % slides.length;
  slides[currentSlide].classList.remove('active');
  slides[currentSlide].setAttribute('aria-hidden', 'true');
  currentSlide = next;
  slides[currentSlide].classList.add('active');
  slides[currentSlide].removeAttribute('aria-hidden');
  currentNumber.textContent = String(currentSlide + 1).padStart(2, '0');
  progressFill.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  progress.setAttribute('aria-valuenow', String(currentSlide + 1));
  menuItems.forEach((item, itemIndex) => item.setAttribute('aria-current', String(itemIndex === currentSlide)));
  history.replaceState(null, '', `#slide-${currentSlide + 1}`);
  closeMenu(false);
}

function openMenu() {
  menu.hidden = false;
  backdrop.hidden = false;
  menuTrigger.setAttribute('aria-expanded', 'true');
  menuItems[currentSlide].focus();
}

function closeMenu(returnFocus = true) {
  if (menu.hidden) return;
  menu.hidden = true;
  backdrop.hidden = true;
  menuTrigger.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuTrigger.focus();
}

document.querySelector('#prevButton').addEventListener('click', () => goToSlide(currentSlide - 1));
document.querySelector('#nextButton').addEventListener('click', () => goToSlide(currentSlide + 1));
menuTrigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
document.querySelector('#menuClose').addEventListener('click', () => closeMenu());
backdrop.addEventListener('click', () => closeMenu());

// Buttons, cards, and links with data-goto jump directly to a numbered slide.
document.addEventListener('click', (event) => {
  const jump = event.target.closest('[data-goto]');
  if (!jump) return;
  event.preventDefault();
  goToSlide(Number(jump.dataset.goto) - 1);
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (isTyping) return;

  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    return;
  }
  if (event.key.toLowerCase() === 'm') {
    event.preventDefault();
    menu.hidden ? openMenu() : closeMenu();
    return;
  }
  if (menu.hidden && event.key === 'ArrowRight') {
    event.preventDefault();
    goToSlide(currentSlide + 1);
  } else if (menu.hidden && event.key === 'ArrowLeft') {
    event.preventDefault();
    goToSlide(currentSlide - 1);
  } else if (menu.hidden && event.code === 'Space') {
    event.preventDefault();
    goToSlide(currentSlide + 1);
  } else if (menu.hidden && /^[1-9]$/.test(event.key)) {
    goToSlide(Number(event.key) - 1);
  }
});

// Swipe only when the gesture is clearly horizontal, leaving vertical scrolling intact.
document.querySelector('#slides').addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

document.querySelector('#slides').addEventListener('touchend', (event) => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.25) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
}, { passive: true });

// Restore a directly linked slide when the page is opened with a slide hash.
const initialSlide = Number(location.hash.match(/^#slide-(\d+)$/)?.[1]);
if (initialSlide >= 1 && initialSlide <= slides.length) goToSlide(initialSlide - 1);
else {
  slides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== 0)));
  progressFill.style.width = `${100 / slides.length}%`;
}
