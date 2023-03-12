import ImagesApiService from './js/images-service';
import LoadMoreBtn from './js/components/load-more-btn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  imagesContainer: document.querySelector('.gallery'),
  searchBtn: document.querySelector('.search-button'),
};

refs.searchBtn.disabled = true;

const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

const imagesApiService = new ImagesApiService();

const imagesGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

refs.searchForm.addEventListener('input', onFormInput);
refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onAddImages);

function onFormInput(e) {
  e.currentTarget.elements.searchQuery.value.trim() === ''
    ? (refs.searchBtn.disabled = true)
    : (refs.searchBtn.disabled = false);
}

function onSearch(e) {
  e.preventDefault();
  loadMoreBtn.hide();
  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  imagesApiService.resetPage();
  clearImagesContainer();
  onAddImages();
}

function onAddImages() {
  loadMoreBtn.disable();
  imagesApiService
    .fetchImages(loadMoreBtn)
    .then(images => {
      appendImagesMarkup(images);
    })
    .catch(onFetchError);
}

function appendImagesMarkup(images) {
  if (!images) {
    return;
  }
  refs.imagesContainer.insertAdjacentHTML(
    'beforeend',
    createImagesMarkup(images)
  );
  imagesApiService.page > 2 && scrollOnLoading();
  imagesGallery.refresh();
  loadMoreBtn.enable();
}

function createImagesMarkup(images) {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
                <a href="${largeImageURL}">
                  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                </a>
                  <div class="info">
                    <p class="info-item">
                      <b>Likes ${likes}</b>
                    </p>
                    <p class="info-item">
                      <b>Views ${views}</b>
                    </p>
                    <p class="info-item">
                      <b>Comments ${comments}</b>
                    </p>
                    <p class="info-item">
                      <b>Downloads ${downloads}</b>
                    </p>
                  </div>
                </div>`;
      }
    )
    .join('');
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}

function onFetchError(error) {
  console.log(error);
}

function scrollOnLoading() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.75,
    behavior: 'smooth',
  });
}
