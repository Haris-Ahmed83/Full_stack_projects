const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.close-modal');
const btnsOpenModal = document.querySelectorAll('.show-modal');

const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// Attach event listeners to all 'show-modal' buttons
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

// Attach event listener to the 'close-modal' button
btnCloseModal.addEventListener('click', closeModal);

// Attach event listener to the overlay to close the modal when clicking outside
overlay.addEventListener('click', closeModal);

// Attach event listener for the 'Escape' key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
