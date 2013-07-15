/*!
** create by zhangxinxu(.com) 2013-07-15
** a simple method for custom scrolling
** it can be used on both mobile and parts desktop browser IE9+/FF/Chrome/...
*/

var simpScroller = (function() {
	// 根据是否支持touch方法确定事件的类型
	var _upSupportTouch = !((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window) * 1
		, _event = {
		start: ["touchstart", "mousedown"][_upSupportTouch],
		move: ["touchmove", "mousemove"][_upSupportTouch],
		end: ["touchend", "mouseup"][_upSupportTouch]
	};
	
	// 滚动
	var _scroller = function(container, direction, params) {
		var key = "top", Key = "Top", size = "height", Size = "Height", pageKey = "pageY";
		if (direction == "horizontal") {
			key = "left";
			Key = "Left"
			size = "width";
			Size = "Width"
			pageKey = "pageX";
		}
		
		
		// 插入滚动条
		var scroller = null;
		if (params.hideScrollBar == false) {
			scroller = document.createElement("div");
			scroller.className = "scroller_" + direction;
			container.appendChild(scroller);
		}
		
		// 容器高度以及包含滚动的高度
		var sizeContainer = container["client" + Size]
			// 因为有滚动动态加载等情况出现，因此默认为0
			, sizeContainerWithScroll = 0;
		
		// 滚动条位置定位方法
		var fnPosScroll = function() {
			if (scroller == null) return;
			var sizeScroller = scroller.style[size].replace("px", "")
				, keyScroller = sizeContainer * container["scroll" + Key] / sizeContainerWithScroll;
			
			// 边界溢出的修正
			if (sizeContainer - sizeScroller - keyScroller <= 0) {
				keyScroller = sizeContainer - sizeScroller;
			}
			// 滚动条的定位
			scroller.style["margin" + Key] = container["scroll" + Key] + "px";
			scroller.style[key] = keyScroller + "px";
			if (key == "top") {
				scroller.style.right = -1 * container.scrollLeft + "px";
			} else {
				scroller.style.bottom = -1 * container.scrollTop + "px";
			}
		};
		
		// 事件
		var pos = {};
		container.addEventListener(_event.start, function(event) {	
			sizeContainerWithScroll = this["scroll" + Size];
			pos[pageKey] = event[pageKey] || event.touches[0][pageKey];
			pos[key] = this["scroll" + Key];
			document.moveFollow = true;
			if (scroller && sizeContainerWithScroll > sizeContainer) {
				scroller.style.visibility = "visible";
				scroller.style.opacity = 1;
				scroller.style[size] = (sizeContainer * sizeContainer / sizeContainerWithScroll) + "px";
				scroller.style["margin" + Key] = this["scroll" + Key] + "px";
				fnPosScroll();	
			}
		});	
		container.addEventListener(_event.move, function(event) {		
			if (_upSupportTouch == false || (document.moveFollow == true)) {
				// touch设备或有可移动标志
				this["scroll" + Key] = pos[key] + (pos[pageKey] - (event[pageKey] || event.touches[0][pageKey]));
			}
			fnPosScroll();
			event.preventDefault();
		});
		container.addEventListener(_event.end, function(event) {
			scroller.style.opacity = 0;
			scroller.style.visibility = "hidden";
		});
		
		if (_upSupportTouch == true) {
			document.addEventListener("mouseup", function() {
				this.moveFollow = false;	
			});	
		}
	};
	
	// 滚动方法
	return function(container, options) {
		options = options || {};
		// 确定参数
		var params = new Object({
			verticalScroll: true,
			horizontalScroll: false,
			hideScrollBar: false,
			onScroll: function() {}
		}), key;
		for (key in options) {
			params[key] = options[key];	
		}
		
		// 如果容器position为static, 改成relative
		if (window.getComputedStyle(container).position == "static") {
			container.style.position = "relative";
		}
		
		if (params.verticalScroll == true) {
			_scroller(container, "vertical", params);	
		}
		if (params.horizontalScroll == true) {
			_scroller(container, "horizontal",  params);	
		}
	};
})();
