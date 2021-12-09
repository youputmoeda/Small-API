var modalBtn = document.querySelector('.modal-btn');
var modalBg = document.querySelector('.modal-bg');
var modalClose = document.querySelector('.modal-close');
var modal_Af_search = document.querySelector('.modal-after-search');

modalBtn.addEventListener('click', function(){
    modalBg.classList.add('bg-active');
});

modalClose.addEventListener('click', function(){
    modalBg.classList.remove('bg-active')
});

modal_Af_search.addEventListener('click', function(){
    modalBg.classList.remove('bg-active')
});