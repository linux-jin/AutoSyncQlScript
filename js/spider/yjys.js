class yjysClass extends WebApiBase {
    constructor() {
        super()
        this.webSite = 'https://www.yjys02.com'
        this.UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        this.cookie = ''
    }

    async getClassList(args) {
        const webUrl = args.url
        this.webSite = UZUtils.removeTrailingSlash(webUrl)
        let backData = new RepVideoClassList()
        try {
            const pro = await req(webUrl + '/zzzzz', { headers: { 'User-Agent': this.UA } })
            this.cookie = pro.headers['set-cookie']
            backData.error = pro.error
            const proData = pro.data
            if (proData) {
                let classes = [
                    {
                        type_id: '1',
                        type_name: '',
                        hasSubclass: true,
                    },
                ]
                backData.data = classes
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
            let url = UZUtils.removeTrailingSlash(this.webSite) + `/s/all`
            const pro = await req(url, { headers: { 'User-Agent': this.UA, Cookie: this.cookie } })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                let allFilterBox = $('.card-body.all-filter-wrapper dl')
                allFilterBox.each((index, element) => {
                    let name = $(element).find('dt').text().replace('：', '')
                    let items = $(element).find('dd > a')

                    let filterTitle = new FilterTitle()
                    filterTitle.name = name
                    filterTitle.list = []
                    items.each((index, element) => {
                        const name = $(element).text()
                        const path = $(element).attr('href')
                        const regex = new RegExp(`\/s\/(.*)`)
                        const match = path.match(regex)
                        const parsStr = match ? match[1] : null
                        if (parsStr) {
                            let filterLab = new FilterLabel()
                            filterLab.name = name
                            filterLab.id = parsStr.replace('all?', '')
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
        let backData = new RepVideoList()
        backData.data = []
        try {
            // 類型不是查詢參數，從數組中取出
            let type = args.filter[1]
            args.filter.splice(1, 1)
            let params = []
            args.filter.forEach((e, _) => {
                let id = e.id
                params.push(id)
            })
            params = params.filter((e) => e !== 'all')
            const url = UZUtils.removeTrailingSlash(this.webSite) + '/s/' + type.id + `/${args.page}/` + '?' + params.join('&')

            const pro = await req(url, { headers: { 'User-Agent': this.UA, Cookie: this.cookie } })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                const allVideo = $('.card-body > .row > div')
                let videos = []
                allVideo.each((index, element) => {
                    let videoDet = new VideoDetail()
                    videoDet.vod_id = $(element).find('a').attr('href')
                    videoDet.vod_pic = $(element).find('img').attr('src')
                    videoDet.vod_name = $(element).find('h3').text()
                    videoDet.vod_remarks = $(element).find('span').text()

                    videos.push(videoDet)
                })

                backData.data = videos
            }
        } catch (error) {
            backData.error = '获取视频列表失败～ ' + error
        }

        return JSON.stringify(backData)
    }

    async getVideoDetail(args) {
        let backData = new RepVideoDetail()
        const webUrl = this.webSite + args.url
        try {
            const pro = await req(webUrl, { headers: { 'User-Agent': this.UA, Cookie: this.cookie } })
            backData.error = pro.error
            const proData = pro.data
            if (proData) {
                const $ = cheerio.load(proData)
                let vod_content = $('#synopsis .card-body').text()
                let vod_pic = $('div.cover-lg-max-25 > img').attr('src')
                let vod_name = $('div.container-xl > div:nth-child(1) > div > div.row.align-items-center > div.col > h2').text()
                let detList = $('div.container-xl > div:nth-child(1) > div > div.row.mt-3 > div.col.mb-2 > p')
                let vod_year = ''
                let vod_director = ''
                let vod_actor = ''
                let vod_area = ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = ''

                detList.each((_, element) => {
                    let text = $(element).text()
                    if (text.includes('年份')) {
                        vod_year = text.replace('年份：', '')
                    } else if (text.includes('导演')) {
                        vod_director = text.replace('导演：', '')
                    } else if (text.includes('主演')) {
                        vod_actor = text.replace('主演：', '')
                    } else if (text.includes('地区')) {
                        vod_area = text.replace('制片国家/地区：', '')
                    } else if (text.includes('语言')) {
                        vod_lang = text.replace('语言：', '')
                    } else if (text.includes('类型')) {
                        type_name = text.replace('类型：', '')
                    }
                })

                let playlist = $('#play-list').find('a.btn')
                let vod_play_url = ''
                playlist.each((_, element) => {
                    let name = $(element).text()
                    let url = $(element).attr('href')
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
        let url = UZUtils.removeTrailingSlash(this.webSite) + args.url
        try {
            const pro = await req(url, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let pid = proData.match(/var pid = (\d+);/)[1]
                var t = new Date().getTime()
                let key = Crypto.enc.Utf8.parse(
                    Crypto.MD5(pid + '-' + t)
                        .toString()
                        .substring(0, 16)
                )
                let encrypted = Crypto.AES.encrypt(pid + '-' + t, key, {
                    mode: Crypto.mode.ECB,
                    padding: Crypto.pad.Pkcs7,
                })
                let sg = encrypted.ciphertext.toString(Crypto.enc.Hex).toUpperCase()
                let lines = this.webSite + '/lines?t=' + t + '&sg=' + sg + '&pid=' + pid
                let res = await req(lines, { headers: { 'User-Agent': this.UA, Cookie: this.cookie } })
                if (res.data.data.url3) {
                    backData.data = res.data.data.url3.split(',')[0]
                } else {
                    // backData.data = res.data.data.m3u8.replace('https://www.bde4.cc', this.webSite)
                    backData.error = '資源失效!'
                }
                backData.headers = { 'User-Agent': this.UA }
            }
        } catch (e) {
            UZUtils.debugLog(e)
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }

    async searchVideo(args) {
        let backData = new RepVideoList()
        // 搜尋需要圖形驗證碼
        try {
            backData.data = []
        } catch (e) {
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }
}
let yjys20240824 = new yjysClass()
