// ignore
import { WebApiBase, VideoClass } from '../core/uzCode.js'
import { parse } from 'node-html-parser'
// ignore

class www4kvmClass extends WebApiBase {
    constructor() {
        super()
        this.webSite = 'https://www.4kvm.org'
        this.headers = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        }
        this.ignoreClassName = ['首页', '高分电影', '影片下载', '公告']
    }

    /**
     * 异步获取分类列表的方法。
     * @param {UZArgs} args
     * @returns {Promise<RepVideoClassList>}
     */
    async getClassList(args) {
        let webUrl = args.url
        // 如果通过首页获取分类的话，可以将对象内部的首页更新
        this.webSite = this.removeTrailingSlash(webUrl)
        let backData = new RepVideoClassList()
        try {
            const pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allClass = document.querySelector('#main_header').querySelectorAll('a')
                let list = []
                for (let index = 0; index < allClass.length; index++) {
                    const element = allClass[index]
                    let isIgnore = this.isIgnoreClassName(element.text)
                    if (isIgnore) {
                        continue
                    }
                    let type_name = element.text
                    let url = element.attributes['href']

                    url = this.combineUrl(url)
                    // url = url.slice(0, -5)

                    if (url.length > 0 && type_name.length > 0) {
                        let videoClass = new VideoClass()
                        videoClass.type_id = url
                        videoClass.type_name = type_name
                        list.push(videoClass)
                    }
                }
                backData.data = list
            }
        } catch (error) {
            backData.error = '获取分类失败～' + error.message
        }

        return JSON.stringify(backData)
    }

    /**
     * 获取分类视频列表
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async getVideoList(args) {
        let listUrl = this.removeTrailingSlash(args.url) + '/page/' + args.page
        let backData = new RepVideoList()
        try {
            let pro = await req(listUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allVideo = document.querySelectorAll('#archive-content article')
                if (allVideo.length === 0) allVideo = document.querySelectorAll('.items article')
                let videos = []
                for (let index = 0; index < allVideo.length; index++) {
                    const element = allVideo[index]
                    let vodUrl = element.querySelector('.poster a')?.attributes['href'] ?? ''
                    let vodPic = element.querySelector('.poster img')?.attributes['src'] ?? ''
                    let vodName = element.querySelector('.poster img')?.attributes['alt'] ?? ''
                    let vodDiJiJi = element.querySelector('.update')?.text ?? ''
                    let score = element.querySelector('.rating').text ?? ''

                    let videoDet = new VideoDetail()
                    videoDet.vod_id = vodUrl
                    videoDet.vod_pic = vodPic
                    videoDet.vod_name = vodName.replace(/amp;/g, '')
                    videoDet.vod_remarks = vodDiJiJi
                    videoDet.vod_douban_score = score
                    videos.push(videoDet)
                }
                backData.data = videos
            }
        } catch (error) {
            backData.error = '获取列表失败～' + error.message
        }
        return JSON.stringify(backData)
    }

    /**
     * 获取视频详情
     * @param {UZArgs} args
     * @returns {Promise<RepVideoDetail>}
     */
    async getVideoDetail(args) {
        let backData = new RepVideoDetail()
        try {
            let webUrl = args.url
            // if (webUrl.includes('tvshows')) let series = null
            let pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let vod_content = document.querySelector('#desc p')?.text ?? ''
                let vod_pic = document.querySelector('.ewave-content__thumb img').getAttribute('data-original') ?? ''
                let vod_name = document.querySelector('h1.title')?.text ?? ''
                let detList = document.querySelectorAll('ewave-content__detail p.data')
                let vod_year = ''
                let vod_director = ''
                let vod_actor = ''
                let vod_area = ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = ''

                let newDetList = []
                detList.forEach((e) => {
                    if (e.text.includes('/')) {
                        let temp = e.text.split('/')
                        newDetList = newDetList.concat(temp)
                    } else newDetList.push(e.text)
                })

                for (let index = 0; index < newDetList.length; index++) {
                    const element = newDetList[index].trim()
                    if (element.includes('年份')) {
                        vod_year = element.replace('年份：', '')
                    } else if (element.includes('导演')) {
                        vod_director = element.replace('导演：', '')
                    } else if (element.includes('主演')) {
                        vod_actor = element.replace('主演：', '')
                    } else if (element.includes('地区')) {
                        vod_area = element.replace('地区：', '')
                    } else if (element.includes('语言')) {
                        vod_lang = element.replace('语言：', '')
                    } else if (element.includes('类型')) {
                        type_name = element.replace('类型：', '')
                    } else if (element.includes('豆瓣')) {
                        vod_douban_score = element.replace('豆瓣：', '')
                    }
                }

                let vod_play_from = []
                document.querySelectorAll('.ewave-pannel__head .playlist-slide ul li a').forEach((e) => {
                    let from = e.text || ''
                    // UZUtils.debugLog('from:' + from)
                    vod_play_from.push(from)
                })

                let vod_play_url = []
                document.querySelectorAll('.tab-content > div').forEach((e) => {
                    let eps = e.querySelectorAll('li')
                    let playUrl = ''
                    eps.forEach((e) => {
                        let ep = e.querySelector('a')
                        playUrl += ep.text
                        playUrl += '$'
                        playUrl += ep.getAttribute('href')
                        playUrl += '#'
                    })
                    // UZUtils.debugLog('playurl:' + playUrl)
                    vod_play_url.push(playUrl)
                })
                // UZUtils.debugLog(vod_play_from)
                // UZUtils.debugLog(vod_play_url)

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
                detModel.vod_name = vod_name.replace(/amp;/g, '')
                detModel.vod_play_url = vod_play_url.join('$$$')
                detModel.vod_id = webUrl
                detModel.vod_play_from = vod_play_from.join('$$$')

                backData.data = detModel
            }
        } catch (error) {
            backData.error = '获取视频详情失败' + error.message
        }

        return JSON.stringify(backData)
    }

    /**
     * 获取视频的播放地址
     * @param {UZArgs} args
     * @returns {Promise<RepVideoPlayUrl>}
     */
    async getVideoPlayUrl(args) {
        let backData = new RepVideoPlayUrl()
        // let reqUrl = this.combineUrl(args.url)
        let reqUrl = 'https://www.4kvm.org/artplayer?mvsource=0&id=162260&type=hls'

        try {
            const pro = await req(reqUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data

            if (proData) {
                let document = parse(proData)
                let script = document.querySelector('body script').text
                // UZUtils.debugLog(script)
                let url = script.match(/url:'(.*)',/)[1]
                // UZUtils.debugLog(url)
                backData.data = url
            }
        } catch (error) {
            backData.error = error.message
        }
        return JSON.stringify(backData)
    }

    /**
     * 搜索视频
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async searchVideo(args) {
        let backData = new RepVideoList()
        // Search requires verification code
        return JSON.stringify(backData)
    }

    combineUrl(url) {
        if (url === undefined) {
            return ''
        }
        if (url.indexOf(this.webSite) !== -1) {
            return url
        }
        if (url.startsWith('/')) {
            return this.webSite + url
        }
        return this.webSite + '/' + url
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

    removeTrailingSlash(str) {
        if (str.endsWith('/')) {
            return str.slice(0, -1)
        }
        return str
    }
}
let www4kvm20240705 = new www4kvmClass()
