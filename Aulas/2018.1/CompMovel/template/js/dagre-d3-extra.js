function dagreRenderAllSlides() {

    var j, total = slideshow.getSlideCount(), current = slideshow.getCurrentSlideIndex() + 1;

    slideshow.gotoFirstSlide();

    for (j = 0; j < total; j++) {

        var slide = document.getElementsByClassName('remark-visible')[0];
        var svgList = slide.getElementsByTagName('svg');

        var i;
        for (i = 0; i < svgList.length; i++) {

            if ('idx' in svgList[i].attributes) {

                var svg = svgList[i];
                var idx = parseInt(svg.attributes.idx);
                d3.select(svgList[i]).call(dagreD3.render(), window.dagreGraphs[0]);
                svg.attributes.removeNamedItem('idx');
            }
        }

        slideshow.gotoNextSlide();
    }

    slideshow.gotoSlide(current);

}
