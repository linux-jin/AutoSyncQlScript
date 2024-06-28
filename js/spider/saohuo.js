// ignore
import { WebApiBase, VideoClass } from '../core/uzCode.js'
import { parse } from 'node-html-parser'
// ignore

class saohuoClass extends WebApiBase {
    webSite = 'https://saohuo.tv'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
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
        var backData = new RepVideoClassList()
        try {
            const pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allClass = document.querySelectorAll('nav.top_bar > a')
                let list = []
                for (let index = 0; index < allClass.length; index++) {
                    const element = allClass[index]
                    let isIgnore = this.isIgnoreClassName(element.text)
                    if (isIgnore) {
                        continue
                    }
                    let type_name = element.text
                    let url
                    if (type_name === '动漫') {
                        url = '/list/4.html'
                    } else url = element.attributes['href']

                    url = this.combineUrl(url)
                    url = url.slice(0, -5)

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
        let listUrl = this.removeTrailingSlash(args.url) + '-' + args.page + '.html'
        let backData = new RepVideoList()
        try {
            let pro = await req(listUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allVideo = document.querySelectorAll('ul.v_list div.v_img')
                let videos = []
                for (let index = 0; index < allVideo.length; index++) {
                    const element = allVideo[index]
                    let vodUrl = element.querySelector('a')?.attributes['href'] ?? ''
                    let vodPic = element.querySelector('img')?.attributes['data-original'] ?? ''
                    let vodName = element.querySelector('a')?.attributes['title'] ?? ''
                    let vodDiJiJi = element.querySelector('.v_note')?.text

                    vodUrl = this.combineUrl(vodUrl)

                    let videoDet = new VideoDetail()
                    videoDet.vod_id = vodUrl
                    videoDet.vod_pic = vodPic
                    videoDet.vod_name = vodName
                    videoDet.vod_remarks = vodDiJiJi
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
            let pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let vod_content = document.querySelector('.p_txt')?.innerHTML.split('<br')[0] ?? ''
                let vod_pic =
                    document
                        .querySelector('.m_background')
                        .getAttribute('style')
                        .match(/url\((.+)\)/)[1] ?? ''
                let vod_name = document.querySelector('.v_title')?.text ?? ''
                let detList = document.querySelector('.v_info_box p')?.text ?? ''
                let vod_year = ''
                let vod_director = ''
                let vod_actor = ''
                let vod_area = ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = ''

                let newDetList = detList.split('/')

                for (let index = 0; index < newDetList.length; index++) {
                    const element = newDetList[index].trim()
                    if (/^\d{4}$/.test(element)) {
                        vod_year = element
                    } else if (element.includes('导演')) {
                        vod_director = element.replace('导演：', '')
                    } else if (element.includes('主演')) {
                        vod_actor = element.replace('主演：', '')
                    } else if (element.endsWith('分')) {
                        vod_douban_score = element
                    } else {
                        vod_area = element
                    }
                }

                let play_from = []
                document
                    .querySelector('ul.from_list')
                    ?.querySelectorAll('li')
                    .forEach((e) => {
                        play_from.push(e.text)
                    })

                let juJiDocment = document.querySelector('#play_link')?.querySelectorAll('li') ?? []
                let vod_play_from = ''
                let vod_play_url = ''
                for (let i = 0; i < juJiDocment.length; i++) {
                    let playLinkList = juJiDocment[i]
                    let playLinks = playLinkList.querySelectorAll('a')
                    let from = play_from[i]

                    for (let j = playLinks.length - 1; j >= 0; j--) {
                        const element = playLinks[j]
                        vod_play_url += element.text
                        vod_play_url += '$'
                        vod_play_url += element.attributes['href']
                        vod_play_url += '#'
                    }
                    vod_play_from += from.trim() + '$$$'
                    vod_play_url += '$$$'
                }

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
                detModel.vod_id = webUrl
                detModel.vod_play_from = vod_play_from

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
        let reqUrl = this.combineUrl(args.url)

        try {
            const pro = await req(reqUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data

            if (proData) {
                let document = parse(proData)
                let iframeUrl = document.querySelector('iframe')?.attributes['src'] ?? ''
                let apiurl = iframeUrl ? UZUtils.getHostFromURL(iframeUrl) + '/api.php' : ''

                let resp = await req(iframeUrl, {
                    headers: this.headers
                })
                backData.error = resp.error
                if (resp.data) {
                    let respScript = parse(resp.data).querySelector('body script').text
                    let url = respScript.match(/var url = "(.*)"/)[1]
                    let t = respScript.match(/var t = "(.*)"/)[1]
                    let key = respScript.match(/var key = "(.*)"/)[1]

                    let presp = await req(apiurl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': this.headers['User-Agent'],
                            Referer: iframeUrl
                        },
                        data: {
                            url: url,
                            t: t,
                            key: key,
                            act: 0,
                            play: 1
                        }
                    })
                    let purl = presp.data.url
                    backData.data = /http/.test(purl) ? purl : UZUtils.getHostFromURL(iframeUrl) + purl
                } else backData.error = 'resp is empty'
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

    ignoreClassName = ['最新', '最热']

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
var saohuo20240623 = new saohuoClass()
