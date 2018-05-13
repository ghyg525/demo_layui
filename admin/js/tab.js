/**
 * 菜单标签切换功能
 * 已打开的菜单会缓存到本地
 */
layui.use(["element","jquery"],function(){
	var $ = layui.jquery;
	var element = layui.element;

	var filter = "tab"; // tab选择器 lay-filter="tab"


	//通过title获取lay-id
	getLayid = function(title){
		var layid;
		$(".layui-tab-title.top_tab li").each(function(){
			if($(this).find("cite").text() == title){
				layid = $(this).attr("lay-id");
				return;
			}
		})
		return layid;
	}
	
	//通过title判断tab是否存在
	hasTab = function(title){
		var flag = false;
		$(".layui-tab-title.top_tab li").each(function(){
			if($(this).find("cite").text() == title){
				flag = true;
				return;
			}
		})
		return flag;
	}
	
	// 添加tab
	$("body").on("click",".layui-nav-tree .layui-nav-item a, .top_btn",function(){
		//构建当前窗口内容
		var curmenu = {	
			"icon" : $(this).find("i.layui-icon").attr("data-icon"),
			"title" : $(this).find("cite").text(),
			"href" : $(this).attr("data-url"),
			"layid" : new Date().getTime() // 随机生成id
		}
		// 判断当前菜单是否已经显示 (通过菜单名称唯一标识)
		if(hasTab($(this).find("cite").text())){ // 已经存在
			// 获取已经存在的tab id
			var layid = getLayid($(this).find("cite").text());
			curmenu.layid = layid;
		} else { // 还没有显示此菜单
			// 创建新菜单tab
			var title = '<i class="layui-icon">'+ curmenu.icon +'</i>';
			title += '<cite>'+ curmenu.title +'</cite>';
			title += '<i class="layui-icon layui-unselect layui-tab-close">&#x1006;</i>';
			// 添加显示新菜单tab
			element.tabAdd(filter, {
		        title : title,
		        content :"<iframe src='"+ curmenu.href +"'></frame>",
		        id : curmenu.layid
		    })
		    // 缓存新tab
		    var menu = JSON.parse(window.sessionStorage.getItem("menu"));
			menu = menu ? menu :[];
			menu.push(curmenu);
			window.sessionStorage.setItem("menu",JSON.stringify(menu));
		}
		// 显示当前tab
		element.tabChange(filter, curmenu.layid);
		// 缓存当前tab
		window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));
		// 重新加载iframe
		$('.layui-show iframe').attr('src', $('.layui-show iframe').attr('src'));
	})
	
	
	// 切换tab
	$("body").on("click",".top_tab li",function(){
		// 切换tab
		element.tabChange(filter,$(this).attr("lay-id"));
		// 切换后缓存当前窗口的内容
		if($(this).index() == 0){
			window.sessionStorage.setItem("curmenu","");
		}else {
			var menu = JSON.parse(window.sessionStorage.getItem("menu"));
			var curmenu = menu[$(this).index()-1];
			window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));
		}
	})

	// 删除tab
	$("body").on("click",".top_tab li i.layui-tab-close",function(){
		var index = $(this).parent("li").index();
		// 此处删除tab后获取index会出错, 所以先获取index再删除
		element.tabDelete("tab",$(this).parent("li").attr("lay-id"));
		// 删除后处理缓存信息
		var menu = JSON.parse(window.sessionStorage.getItem("menu"));
		var curmenu = JSON.parse(window.sessionStorage.getItem("curmenu"));
		// 如果删除的是当前选中的tab
		if(JSON.stringify(curmenu) == JSON.stringify(menu[index-1])){
			curmenu = index>1 ? menu[index-2] : ""; // 当前菜单变为上一个
		}
		menu.splice((index-1), 1); // 从缓存数据中删除项目
		window.sessionStorage.setItem("menu",JSON.stringify(menu));
		window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));
		return false; // 防止事件冒泡(删除后触发切换tab方法)
	})

	//刷新后还原打开的窗口
	$(function(){
		// 如果缓存中有菜单信息
		var menuStr = window.sessionStorage.getItem("menu");
		if(menuStr!=null && menuStr!="undefined" && menuStr!="[]"){
			// 恢复刷新前已打开的菜单
			var menu = JSON.parse(menuStr);
			for(var i=0;i<menu.length;i++){
				var title = '<i class="layui-icon">'+menu[i].icon+'</i>';
				title += '<cite>'+menu[i].title+'</cite>';
				title += '<i class="layui-icon layui-unselect layui-tab-close">&#x1006;</i>';
				element.tabAdd("tab",{
					title : title,
			        content :"<iframe src='"+menu[i].href+"'></frame>",
			        id : menu[i].layid
				});
			}
			// 定位到刷新前的窗口
			var curmenuStr = window.sessionStorage.getItem("curmenu");
			if(curmenuStr!=null && curmenuStr!="undefined" && curmenuStr!=""){
				var curmenu = JSON.parse(curmenuStr);
				element.tabChange("tab",curmenu.layid);
			}
		}
	})
	
})