var rule = {
	title: '腾云驾雾[官]',
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
	timeout: 5000,
	cate_exclude: '会员|游戏|全部',
	class_name: '4K电视剧&4K电影&4K综艺&4K动漫&4K少儿&4K纪录片',
	class_url: 'tv&movie&variety&cartoon&child&doco',
	limit: 20,
	play_parse:true,
	一级: '.list_item;img&&alt;img&&src;a&&Text;a&&data-float',
	二级: $js.toString(() => {
		VOD = {};
		let d = [];
		let video_list = [];
		let video_lists = [];
		let QZOutputJson;
		let html = fetch(input, fetch_params);
		let sourceId = input.split("cid=")[1];
		let cid = sourceId;
		pdfh = jsp.pdfh;
		pd = jsp.pd;
		try {
			let json = JSON.parse(html);
			VOD = {
				vod_url: input,
				vod_name: json.c.title,
				type_name: json.typ?.join(",") || '',
				vod_actor: json.nam?.join(",") || '',
				vod_year: json.c.year || '',
				vod_content: json.c.description || '',
				vod_remarks: json.rec || '',
				vod_pic: urljoin2(input, json.c.pic)
			}
		} catch (e) {
			log("解析基础信息错误:" + e.message)
		}
		try {
			let json = JSON.parse(html);
			video_lists = json.c.video_ids || [];
			if (video_lists.length === 1) {
				let vid = video_lists[0];
				let url = `https://v.qq.com/x/cover/${cid}/${vid}.html`;
				d.push({ title: "正片", url: url })
			} else if (video_lists.length > 1) {
				for (let i = 0; i < video_lists.length; i++) {
					let vid = video_lists[i];
					let url = `https://v.qq.com/x/cover/${cid}/${vid}.html`;
					d.push({ title: `第${i+1}集`, url: url })
				}
			}
		} catch(e){
			log("解析分集错误:"+e.message)
		}
		VOD.vod_play_from = "腾讯原生";
		VOD.vod_play_url = d.map(it=>it.title+"$"+it.url).join("#");
		setResult(d);
	}),
	搜索: $js.toString(() => {
		let d = [];
		pdfa = jsp.pdfa;
		pdfh = jsp.pdfh;
		pd = jsp.pd;
		let html = request(input);
		let baseList = pdfa(html, "body&&.result_item_v");
		baseList.forEach(it=>{
			let longText = pdfh(it, ".result_title&&a&&Text");
			let shortText = pdfh(it, ".type&&Text");
			let fromTag = pdfh(it, ".result_source&&Text");
			let img = pd(it, ".figure_pic&&src");
			let rdata = pdfh(it, "div&&r-data");
			if(!rdata) return;
			let cid = rdata.match(/.*\/(.*?)\.html/);
			if(!cid) return;
			let url = "https://node.video.qq.com/x/api/float_vinfo2?cid=" + cid[1];
			if(fromTag.match(/腾讯/)){
				d.push({
					title: longText?.split(shortText||'')[0] || longText,
					img: img,
					url: url,
					desc: shortText || ''
				})
			}
		});
		setResult(d);
	})
}
