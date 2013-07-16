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
			params.container.appendChild(scroller);
		}
		
		// 容器尺寸以及包含滚动的尺寸
		var sizeContainer = container["client" + Size]
			// 因为有滚动动态加载等情况出现，因此默认为0
			, sizeContainerWithScroll = 0;
		
		// 滚动条位置定位方法
		var fnPosScroll = function() {
			if (scroller == null) return;
			var sizeScroller = scroller.style[size].replace("px", "")
				, keyScroller = container["scroll" + Key] / (sizeContainerWithScroll - sizeContainer) * (sizeContainer - sizeScroller);
			
			// 边界溢出的修正
			if (sizeContainer - sizeScroller - keyScroller <= 0) {
				keyScroller = sizeContainer - sizeScroller;
			}
			// 滚动条的定位
			scroller.style[key] = keyScroller + "px";
		};
		
		// 事件
		var pos = {};
		container.addEventListener(_event.start, function(event) {	
			sizeContainerWithScroll = this["scroll" + Size];
			pos[pageKey] = event[pageKey] || event.touches[0][pageKey];
			pos[key] = this["scroll" + Key];
			document.moveFollow = true;
			if (scroller && sizeContainerWithScroll > sizeContainer) {
				scroller.style.opacity = 1;
				scroller.style[size] = (sizeContainer * sizeContainer / sizeContainerWithScroll) + "px";
				
				fnPosScroll();	
			}
		});	
		container.addEventListener(_event.move, function(event) {		
			if (_upSupportTouch == false || (document.moveFollow == true)) {
				// touch设备或有可移动标志
				this["scroll" + Key] = pos[key] + (pos[pageKey] - (event[pageKey] || event.touches[0][pageKey]));
				// 自定义滚动条的位置
				fnPosScroll();
				// 回调
				params.onScroll.call(this, event);
			}	
			// 阻止默认滚动
			event.preventDefault();
		});
		container.addEventListener(_event.end, function(event) {
			scroller && (scroller.style.opacity = 0);
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
		
		if (window.getComputedStyle(container).position == "static") {
			container.style.position = "relative";
		}

		
		// 子元素们
		var childerns = container.childNodes
		// 文档片段
			, fragment = document.createDocumentFragment();
			
		// 将子元素的集合放在文档片段中
		// 方便实现wrap效果
		[].slice.call(childerns).forEach(function(child) {
			fragment.appendChild(child);	
		});
		
		// wrap的父元素
		var wrap = document.createElement("div");
		wrap.style.height = "100%";
		wrap.style.width = "100%";
		wrap.style.overflow = "auto";
		
		// 容器插入包裹元素
		container.insertBefore(wrap, container.firstElementChild);
		// 加载子元素集合文档片段，完成wrap包裹效果
		wrap.appendChild(fragment);
		params.container = container;
		
		if (params.verticalScroll == true) {
			_scroller(wrap, "vertical", params);	
		}
		if (params.horizontalScroll == true) {
			_scroller(wrap, "horizontal",  params);	
		}
	};
})();
