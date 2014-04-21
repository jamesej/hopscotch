/*
 * jquery.hopscotch.js: v1.0:12/4/2014
 * http://easyresponsive.com/hopscotch
 * 
 * Copyright 2015 James Ellis-Jones
 * Licensed under Eclipse Public License v1.0 http://www.eclipse.org/legal/epl-v10.html
 */

(function ($) {
    $.fn.hopscotchLayout = function (idx, substituteSel) {
        if (this.attr('data-hs-layout-idx') !== 'undefined' && this.data('hs-layout-idx') == idx)
            return this;
        
        var $this = this,
            cls = this.attr('class') || '',
            layout = { max: -1 },
            lastRow = $(this).children().length;
            
        if (cls.indexOf('hs-index-') < 0)
            this.addClass('hs-index-' + idx);
        else
            this.attr('class', cls.replace(/hs-index-\d+/, 'hs-index-' + idx));
        
        // put layout requirements attributes and jQuery object into a holding object
        function getLayoutInfo($item, sInfo) {
            var info = {};
            info.rowcols = sInfo.split(',');
            info.$item = $item;
            return info;
        }
        // recursive function for attaching layoutInfo to a tree-structured object
        function setLayout(layoutInfo, rowcol, depth, subLayout) {
            var parts = rowcol[depth].split(':'),
                idx = parseInt(parts[0]),
                size = 1;
            if (parts[1]) size = parseInt(parts[1]);
            if (rowcol.length - 1 == depth) {
                layoutInfo.size = size;
                subLayout[idx] = layoutInfo;
            }
            else {
                if (!subLayout[idx])
                    subLayout[idx] = { max: -1, size: size };
                setLayout(layoutInfo, rowcol, depth + 1, subLayout[idx]);
            }
            if (idx > subLayout.max)
                subLayout.max = idx;
        }
        // process a layout child into the layout object
        function putLayout($item) {
            var rowVals, layoutInfo;
            if ($item.data('grid-location'))
                rowVals = $item.data('grid-location').split(';');
            else {
                rowVals = lastRow.toString();
                lastRow++;
            }
            
            if (rowVals.length <= idx)
                layoutInfo = getLayoutInfo($item, rowVals[rowVals.length - 1]);
            else
                layoutInfo = getLayoutInfo($item, rowVals[idx]);
            setLayout(layoutInfo, layoutInfo.rowcols, 0, layout);
        }
        // recurse through container children pulling layout children out of containers
        // created by hopscotch
        function buildLayout($item) {
            if ($item == $this || $item.hasClass('hs-container'))
                $item.children().each(function () { if ($(this).css('display') == 'block') buildLayout($(this)); });
            else
                putLayout($item);
        }
        
        buildLayout(this);

        // recursively build the dom from layout tree object, inserting necessary
        // container divs for layout
        function construct($container, subLayout, mode) {
            var totSize = 0, i;
            for (i = 0; i <= subLayout.max; i++) {
                if (subLayout[i]) {
                    if (subLayout[i]['$item']) {
                        $container.append(subLayout[i].$item);
                        if (mode == 'col') {
                            subLayout[i]['$item'].css({ 'float': 'left', 'width': '100%' });
                        } else {
                            subLayout[i]['$item'].css({ 'float': 'left' });
                        }
                    } else {
                        var newMode = mode == 'col' ? 'row' : 'col',
                            $subCont = $("<div class='hs-container hs-" + newMode + "-container'></div>");
                        construct($subCont, subLayout[i], newMode);
                        $container.append($subCont);
                    }
                    totSize += subLayout[i].size;
                }
            }
            if (mode == 'row') {
                var totPc = 0, idx = 0,
                    $children = $container.children();
                for (i = 0; i <= subLayout.max; i++) {
                    if (subLayout[i]) {
                        var pc;
                        if (i == subLayout.max)
                            pc = 100.0 - totPc;
                        else
                            pc = (subLayout[i].size / totSize) * 100.0;
                        $children.eq(idx).css('width', pc + '%');
                        idx++;
                        totPc += pc;
                    }
                }
            }
        }
        
        // substitute attribute values into all recursive children of container
        function substitute($cont, substituteSel, idx) {
            substituteSel = substituteSel || '*';
            var patt = /data-hs([0-9]*)-([a-z]\w*)/;
            $cont.find(substituteSel).each(function (i, el) {
                var attrs = el.attributes,
                    changes = {};
                for (var j = 0; j < attrs.length; j++) {
                    if (patt.test(attrs[j].name)) {
                        var attrIdx = attrs[j].name.replace(patt, '$1'),
                            attrName = attrs[j].name.replace(patt, '$2');
                        if ((attrIdx != '' && parseInt(attrIdx) == idx) || (attrIdx == '' && !changes[attrName]))
                            changes[attrName] = attrs[j].value;
                    }
                }
                for (var c in changes) {
                    if (el[c] != changes[c])
                        el[c] = changes[c];
                }
            })
        }
        
        var $placeholder = $("<div></div>");
        $placeholder.insertAfter(this);
        // Pulls the layout item out of the document so that
        // all child changes are redrawn in one go.
        this.detach();
        construct(this, layout, 'col');
        substitute(this, substituteSel, idx);
        this.addClass('hs-container').addClass('hs-outer-container');
        // put the layout container back into the document
        this.insertBefore($placeholder);
        $placeholder.remove();

        // trigger event just after reinsertion into dom - means we can rely on 
        // proper dimensions
        $this.trigger('hopscotch:layout', idx);

        this.data('hs-layout-idx', idx);
        return this;
    }
    // runs hopscotchLayout if width crosses a stop point
    $.fn.hopscotchResize = function (stopPoints, substituteSel, onChange) {
        var $this = this;
        if ($.isFunction(substituteSel)) {
            onChange = substituteSel;
            substituteSel = null;
        }
        $this.bind('resize', function () { setLayout($this.width()); });
        function setLayout(width) {
            for (var idx = 0; idx < stopPoints.length; idx++) {
                if (width < stopPoints[idx])
                    break;
            }
            $this.hopscotchLayout(idx);
        }
        if ($.isFunction(onChange))
            $this.bind('hopscotch:layout', onChange);
        setLayout($this.width());
    }

})(jQuery, this);