// if (window.innerWidth > 1110) {
//     const slider = snapScroll('.projects__container', {
//         itemsToShow: 3,
//         itemsToScroll: 2,
//         dots: true,
//     });
//     console.log("if");
// } else if (window.innerWidth < 1110 && window.innerWidth > 767) {
//     const slider = snapScroll('.projects__container', {
//         itemsToShow: 2,
//         itemsToScroll: 2,
//         dots: true,
//     });
//     console.log("else if");
// } else {
//     const slider = snapScroll('.projects__container', {});
//     console.log("else");
// }
const slider = snapScroll('.projects__container', {
    itemsToShow: 3,
    itemsToScroll: 2,
    dots: true,
    responsive: {
        '100': {
            itemsToShow: 1,
            itemsToScroll: 1,
        },
        '767': {
            itemsToShow: 2,
        },
        '1024': {
            itemsToShow: 3,
            itemsToScroll: 2
        },
    }
});