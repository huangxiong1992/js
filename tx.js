var rule = {
	title: '腾云驾雾[官]',
	parseUrl: 'https://jx.leduotv.com/api/v1/jx?url=',
	host: 'https://v.qq.com',
	homeUrl: '',
	searchUrl: '/x/search/?q=**&stag=fypage',
	detailUrl: 'https://node.video.qq.com/x/api/float_vinfo2?cid=fyid',
	searchable: 2,
	filterable: 1,
	multi: 1,
	url: '/x/bu/pagesheet/list?_all=1&append=1&channel=fyclass&listpage=1&offset=((fypage-1)*21)&pagesize=21&iarea=-1',
	filter_url: 'sort={{fl.sort or 75}}&iyear={{fl.iyear}}&year={{fl.year}}&itype={{fl.type}}&ifeature={{fl.feature}}&iarea={{fl.area}}&itrailer={{fl.itrailer}}&gender={{fl.sex}}',
	headers: { 'User-Agent': 'PC_UA' },
	timeout: 8000,
	cate_exclude: '会员|游戏|全部',
	class_name: '4K电视剧&4K电影&4K综艺&4K动漫&4K少儿&4K纪录片',
	class_url: 'tv&movie&variety&cartoon&child&doco',
	limit: 20,
	play_parse:true,
	lazy: $js.toString(() => {
		let d = [];
		try {
			let headers = {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
				'Referer':'https://v.qq.com/'
			};
			let res = request(rule.parseUrl + encodeURIComponent(input), { headers: headers });
			let json = JSON.parse(res);
			let urlKey = Object.keys(json).find(k=>k.startsWith('url'));
			if(urlKey && json[urlKey]){
				input = { url: json[urlKey], parse:0, header:rule.headers };
			}
		} catch(e){ log("解析异常："+e) }
		setResult(d);
	}),
	一级: '.list_item;img&&alt;img&&src;a&&Text;a&&data-float',
	二级: $js.toString(() => {
		VOD = {};
		let d = [];
		let html = fetch(input, fetch_params);
		let cid = input.split("cid=")[1];
		pdfh = jsp.pdfh;
		pd = jsp.pd;
		try {
			let json = JSON.parse(html);
			VOD.vod_name = json.c.title;
			VOD.type_name = json.typ?.join(",")||'';
			VOD.vod_actor = json.nam?.join(",")||'';
			VOD.vod_year = json.c.year||'';
			VOD.vod_content = json.c.description||'';
			VOD.vod_pic = urljoin2(input, json.c.pic);
		} catch(e){}
		try {
			let json = JSON.parse(html);
			let vids = json.c.video_ids||[];
			vids.forEach((vid,i)=>{
				d.push({
					title:`第${i+1}集`,
					url:`https://v.qq.com/x/cover/${cid}/${vid}.html`
				})
			})
		}catch(e){}
		VOD.vod_play_from = "解析播放";
		VOD.vod_play_url = d.map(it=>it.title+"$"+it.url).join("#");
		setResult(d);
	}),
	搜索: $js.toString(() => {
		let d = [];
		pdfa = jsp.pdfa;
		pdfh = jsp.pdfh;
		pd = jsp.pd;
		let html = request(input);
		let list = pdfa(html, "body&&.result_item_v");
		list.forEach(it=>{
			let title = pdfh(it, ".result_title&&a&&Text");
			let img = pd(it, ".figure_pic&&src");
			let rdata = pdfh(it, "div&&r-data");
			if(!rdata) return;
			let cid = rdata.match(/\/([^/]+)\.html/);
			if(!cid) return;
			let url = "https://node.video.qq.com/x/api/float_vinfo2?cid="+cid[1];
			d.push({title,img,url})
		});
		setResult(d);
	})
}
