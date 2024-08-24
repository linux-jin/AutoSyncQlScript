class jpyyClass extends WebApiBase {
    constructor() {
        super()
        this.webSite = 'https://www.ghw9zwp5.com'
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: this.webSite,
        }
        this.ignoreClassName = ['首页']
    }

    async getClassList(args) {
        const webUrl = args.url
        this.webSite = UZUtils.removeTrailingSlash(webUrl)
        let backData = new RepVideoClassList()
        try {
            const pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            const proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                let allClass = $('header > div > div[class^="header__HeaderLeftBox"] a')
                let list = []
                allClass.each((index, element) => {
                    const cat = $(element)
                    if (this.isIgnoreClassName(cat.text())) return

                    let name = cat.text()
                    let url = cat.attr('href')
                    if (url.length > 0 && name.length > 0) {
                        let videoClass = new VideoClass()
                        videoClass.hasSubclass = true
                        videoClass.type_id = url.match(/type\/(\d+)/)[1]
                        videoClass.type_name = name
                        list.push(videoClass)
                    }
                })
                backData.data = list
            }
        } catch (e) {
            backData.error = e.message
        }

        return JSON.stringify(backData)
    }

    async getSubclassList(args) {
        let backData = new RepVideoSubclassList()
        backData.data = new VideoSubclass()
        const id = args.url
        try {
            let url = UZUtils.removeTrailingSlash(this.webSite) + `/vod/show/id/${id}`
            const pro = await req(url, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                let allFilterBox = $('.filter-box')
                allFilterBox.each((index, element) => {
                    let name = $(element).find('.filter-title').text()
                    let items = $(element).find('.filter-li')

                    let filterTitle = new FilterTitle()
                    filterTitle.name = name
                    filterTitle.list = []
                    filterTitle.list.push({ name: '全部', id: '' })
                    items.each((index, element) => {
                        const name = $(element).text()
                        const path = $(element).attr('href')
                        const regex = new RegExp(`vod/show/id/${id}(.*)`)
                        const match = path.match(regex)
                        const parsStr = match ? match[1] : null
                        if (parsStr) {
                            let filterLab = new FilterLabel()
                            filterLab.name = name
                            filterLab.id = parsStr
                            filterTitle.list.push(filterLab)
                        }
                    })
                    backData.data.filter.push(filterTitle)
                })
            }
        } catch (error) {
            backData.error = '获取分类失败～ ' + error
        }
        return JSON.stringify(backData)
    }

    async getSubclassVideoList(args) {
        var backData = new RepVideoList()
        backData.data = []
        try {
            let pList = [args.mainClassId]
            if (args.filter.length > 0) {
                // 筛选
                for (let index = 0; index < args.filter.length; index++) {
                    const element = args.filter[index]
                    pList.push(element.id)
                }
            } else {
                pList.push(args.subclassId)
                for (let index = 0; index < 4; index++) {
                    pList.push('')
                }
            }

            let path = pList.join('')
            const url = UZUtils.removeTrailingSlash(this.webSite) + '/vod/show/id/' + path + '/page/' + args.page

            const pro = await req(url)
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                const allVideo = $('.movie-ul > div')
                let videos = []
                let promises = allVideo
                    .map(async (index, element) => {
                        let id = $(element).find('a').attr('href').split('/')[2]
                        let pic = await this.getImg(id)
                        let name = $(element).find('.info-title-box div.title span').text()

                        let video = new VideoDetail()
                        video.vod_id = id
                        video.vod_name = name
                        video.vod_pic = pic
                        video.vod_remarks = $(element).find('.card-img .bottom > div').eq(0).text() || ''
                        return video
                    })
                    .get()

                videos = await Promise.all(promises)
                backData.data = videos
            }
        } catch (error) {
            backData.error = '获取视频列表失败～ ' + error
        }

        return JSON.stringify(backData)
    }

    async getVideoDetail(args) {
        let backData = new RepVideoDetail()
        const webUrl = this.webSite + `/detail/${args.url}`
        try {
            const pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            const proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                let vod_content = $('.wrapper_more_text').text()
                let vod_pic = await this.getImg(args.url)
                let vod_name = $('h1.title').text()
                // let detList = document.querySelectorAll('ewave-content__detail p.data')
                let vod_year = ''
                let vod_director = $('.director').eq(0).text().replace('导演:', '') || ''
                let vod_actor = $('.director').eq(1).text().replace('主演:', '') || ''
                let vod_area = ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = ''

                let juJiDocment = $('div[class^="detail__PlayListBox"]').find('div.listitem')

                let vod_play_url = ''
                juJiDocment.each((index, element) => {
                    let name = $(element).find('a').text()
                    let url = $(element).find('a').attr('href')
                    vod_play_url += name
                    vod_play_url += '$'
                    vod_play_url += url
                    vod_play_url += '#'
                })

                let detModel = new VideoDetail()
                detModel.vod_year = vod_year
                detModel.type_name = type_name
                detModel.vod_director = vod_director
                detModel.vod_actor = vod_actor
                detModel.vod_area = vod_area
                detModel.vod_lang = vod_lang
                detModel.vod_douban_score = vod_douban_score
                detModel.vod_content = vod_content
                detModel.vod_pic = vod_pic
                detModel.vod_name = vod_name
                detModel.vod_play_url = vod_play_url
                detModel.vod_id = args.url

                backData.data = detModel
            }
        } catch (e) {
            backData.error = '获取视频详情失败' + e.message
        }

        return JSON.stringify(backData)
    }

    async getVideoPlayUrl(args) {
        let backData = new RepVideoPlayUrl()
        const parts = args.url.match(/vod\/play\/(.*)\/sid\/(.*)/)
        const id = parts[1]
        const sid = parts[2]
        let reqUrl = `${this.webSite}/api/mw-movie/anonymous/v1/video/episode/url?id=${id}&nid=${sid}`

        try {
            const signKey = this.base64Decode('Y2I4MDg1MjliYWU2YjZiZTQ1ZWNmYWIyOWE0ODg5YmM=')
            const dataStr = reqUrl.split('?')[1]
            const t = Date.now()
            const signStr = dataStr + `&key=${signKey}` + `&t=${t}`
            const headers = {
                'User-Agent': this.headers['User-Agent'],
                deviceId: getUUID(),
                t: t,
                sign: Crypto.SHA1(Crypto.MD5(signStr).toString()).toString(),
            }

            function getUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (e) => ('x' === e ? (16 * Math.random()) | 0 : 'r&0x3' | '0x8').toString(16))
            }

            const pro = await req(reqUrl, { headers: headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let playUrl = proData.data.playUrl
                backData.data = playUrl
                backData.headers = this.headers
            }
        } catch (e) {
            UZUtils.debugLog(e)
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }

    async searchVideo(args) {
        let backData = new RepVideoList()
        let searchUrl = `https://api.zeqaht.com/api.php/provide/vod?ac=detail&wd=${args.searchWord}&pg=${args.page}`
        try {
            let searchRes = await req(searchUrl, { headers: this.headers })
            backData.error = searchRes.error
            let body = searchRes.data
            if (body) {
                let allVideo = JSON.parse(body).list
                let videos = []
                allVideo.forEach((e) => {
                    let vodUrl = e.vod_id
                    let vodPic = e.vod_pic
                    let vodName = e.vod_name
                    let vodDiJiJi = e.vod_remarks || ''

                    let videoDet = new VideoDetail()
                    videoDet.vod_id = vodUrl
                    videoDet.vod_pic = vodPic
                    videoDet.vod_name = vodName
                    videoDet.vod_remarks = vodDiJiJi

                    videos.push(videoDet)
                })
                backData.data = videos
            }
        } catch (e) {
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }

    async getImg(id) {
        let url = `https://api.zeqaht.com/api.php/provide/vod?ac=detail&ids=${id}`
        let res = await req(url)
        let img = JSON.parse(res.data).list[0].vod_pic
        return img
    }

    base64Decode(text) {
        return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text))
    }

    isIgnoreClassName(className) {
        for (let index = 0; index < this.ignoreClassName.length; index++) {
            const element = this.ignoreClassName[index]
            if (className.indexOf(element) !== -1) {
                return true
            }
        }
        return false
    }
}
let jpyy20240716 = new jpyyClass()
