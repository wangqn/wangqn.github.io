const menuPagesArr = menuPages ? menuPages.split(',') : [];
const inPage = typeof IN_PAGE !== 'undefined' ? IN_PAGE : false;
let currentPath = window.location.pathname.replace(/\/$/, '');
let initedTitle;
let initedArticle;
let isMobileScreen = false;

const categoryButtons = document.querySelectorAll('.category-button');
for (const button of categoryButtons) {
    button.addEventListener('click', function () {
        const category = button.getAttribute('data-rel');
        handleCategoryChange(category);
        if (isMobileScreen) {
            window.location.href = '#category-' + category;
            handleMobileMenuState();
        }
    })
}

const posts = document.querySelectorAll('#title-list-nav > a');
for (const post of posts) {
    post.addEventListener('click', function (e) {
        if (!inPage) {
            e.preventDefault();

            if (isMobileScreen) {
                document.querySelector('aside.nav-middle').setAttribute('data-mobile-visible', false);
                document.querySelector('body').setAttribute('data-has-mobile-header', true);
            }

            adjustPostActiveMenu(post.getAttribute('data-href'));
            const node = document.querySelector('.index') || document.querySelector('article').parentElement;

            node.style.opacity = '0.3';
            NProgress.start();
            axios.get(post.getAttribute('data-href')).then(response => {
                const titleSearch = /<title[^>]*>([\s\S]*?)<\/title>/.exec(response.data);
                const title = titleSearch[1];
                document.title = title;
                const search = /(<article[^>]*>[\s\S]*?<\/article>)/.exec(response.data);
                const article = search[1];
                node.innerHTML = article;
                node.style.opacity = '1';
                NProgress.done();
                history.pushState({
                    title, article, category: currentCategory, path: post.getAttribute('data-href'),
                }, null, post.getAttribute('href'));
            })
        }
    })
}

function handleCategoryChange(category = '') {
    const categoryButtons = document.querySelectorAll('.category-button');
    for (const button of categoryButtons) {
        if (button.getAttribute('data-rel') === category) {
            button.setAttribute('data-active', 'true');
        } else {
            button.setAttribute('data-active', 'false');
        }
    }
    const posts = document.querySelectorAll('#title-list-nav > a');
    for (const post of posts) {
        const categories = post.getAttribute('data-categories');
        if (!category || categories && categories.split(',').includes(category)) {
            post.setAttribute('data-visible', 'true');
        } else {
            post.setAttribute('data-visible', 'false');
        }
        // post.setAttribute('href', post.getAttribute('data-href'));
        if (inPage) {
            document.querySelector('aside.nav-middle').setAttribute('data-visible', true);
        }
    }
}

function handlePostChange({ title, article, path } = {}) {
    adjustPostActiveMenu(path);
    document.title = title;
    const node = document.querySelector('.index') || document.querySelector('article').parentElement;
    node.innerHTML = article;
}

function adjustPostActiveMenu(path) {
    const posts = document.querySelectorAll('#title-list-nav > a');
    for (const post of posts) {
        post.setAttribute('data-active', post.getAttribute('data-href') === path);
    }
}

function adjustPostMenuScroll() {
    for (const post of posts) {
        if (post.getAttribute('data-active') === 'true') {
            const top = post.getBoundingClientRect().top;
            document.querySelector('.nav-middle').scrollTo(0, document.querySelector('.nav-middle').scrollTop + top - 100 || 0);
            break;
        }
    }
}

window.onpopstate = function (event) {
    handleCategoryChange(event.state && event.state.category || currentCategory);
    const state = event.state || {};
    handlePostChange({
        ...state,
        title: state.title || initedTitle,
        article: state.article || initedArticle,
        path: state.path || currentPath + '/',
    });
    adjustPostMenuScroll();
    handleMobileMenuState();
}

window.onload = function () {
    if (inPage) {
        const pageLinks = document.querySelectorAll('.custom-menus-page');
        for (link of pageLinks) {
            if (link.getAttribute('data-page') === currentPath) {
                link.setAttribute('data-active', 'true');
            }
        }
    } else {
        initedTitle = document.title;
        initedArticle = document.querySelector('article').parentElement.innerHTML;

        handleCategoryChange(currentCategory);
        adjustPostMenuScroll();
    }
    checkIsMobile();
    handleMobileMenuState();
    document.querySelector('.main').style.opacity = '1';
}

function handleMobileMenuState() {
    hideMobileMenu();
    if (window.location.hash === '#home-nav') {
        showMobileMenu();
    } else if (/#category-/.test(window.location.hash)) {
        const category = window.location.hash.substr(10);
        handleCategoryChange(category);
        showMobileSubMenu();
    } else if (window.location.pathname === '/') {
        showMobileMenu();
    }
}

function showMobileMenu() {
    document.querySelector('aside.nav-left').setAttribute('data-mobile-visible', true);
    document.querySelector('body').setAttribute('data-has-mobile-header', false);
}
function hideMobileMenu() {
    document.querySelector('aside.nav-left').setAttribute('data-mobile-visible', false);
    document.querySelector('aside.nav-middle').setAttribute('data-mobile-visible', false);
    document.querySelector('body').setAttribute('data-has-mobile-header', true);
}
function showMobileSubMenu() {
    document.querySelector('aside.nav-middle').setAttribute('data-mobile-visible', true);
    document.querySelector('body').setAttribute('data-has-mobile-header', false);
}
document.querySelector('.show-mobile-menu').addEventListener('click', handleMobileMenuState);
document.querySelector('.back-to-categories').addEventListener('click', handleMobileMenuState);

function checkIsMobile() {
    isMobileScreen = window.innerWidth <= 768;
}
window.addEventListener('resize', function () {
    checkIsMobile();
});
