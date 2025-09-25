import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = form.querySelector("input[name='search-text']");
const loadMoreBtn = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  const query = input.value.trim();

  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
      backgroundColor: '#ff7fa0',
      messageColor: '#2e2f42',
      width: 280,
      timeout: 4000,
    });
  } else {
    currentQuery = query;
    currentPage = 1;
    clearGallery();
    hideLoadMoreButton();

    await fetchAndRender();
  }
  form.reset();
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  await fetchAndRender();
  smoothScrollAfterAppend();
});

async function fetchAndRender() {
  showLoader();
  hideLoadMoreButton();
  loadMoreBtn.disabled = true;

  try {
    const { hits, totalHits: total } = await getImagesByQuery(
      currentQuery,
      currentPage
    );
    totalHits = total;

    if (!hits.length) {
      hideLoadMoreButton();
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        backgroundColor: '#ff7fa0',
        messageColor: '#2e2f42',
        width: 320,
        timeout: 4000,
      });
      return;
    }

    createGallery(hits);

    const loadedItems = currentPage * PER_PAGE;
    if (loadedItems < totalHits) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
        backgroundColor: '#ff7fa0',
        messageColor: '#2e2f42',
        width: 360,
        timeout: 5000,
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Try again later!',
      position: 'topRight',
      backgroundColor: '#ff7fa0',
      titleColor: '#2e2f42',
      messageColor: '#2e2f42',
      width: 320,
      timeout: 4000,
    });
  } finally {
    hideLoader();
    loadMoreBtn.disabled = false;
  }
}

function smoothScrollAfterAppend() {
  const firstCard = galleryEl.querySelector('.gallery-item');
  if (!firstCard) return;

  const { height } = firstCard.getBoundingClientRect();
  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
