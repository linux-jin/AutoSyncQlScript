// ignore
import { WebApiBase, VideoClass } from '../core/uzCode.js'
import { parse } from 'node-html-parser'
// ignore

class hjkkClass extends WebApiBase {
    webSite = 'https://www.hanjukankan.com'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
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
                let allClass = document.querySelectorAll('ul.myui-header__menu a')
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
            backData.error = '获取分类失败～' + error
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
                let allVideo = document.querySelectorAll('ul.myui-vodlist li')
                let videos = []
                for (let index = 0; index < allVideo.length; index++) {
                    const element = allVideo[index]
                    let vodUrl = element.querySelector('a.myui-vodlist__thumb')?.attributes['href'] ?? ''
                    let vodPic = element.querySelector('a.myui-vodlist__thumb')?.attributes['data-original'] ?? ''
                    let vodName = element.querySelector('a.myui-vodlist__thumb')?.attributes['title'] ?? ''
                    let vodDiJiJi = element.querySelector('span.pic-tag')?.text

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
            backData.error = '获取列表失败～'
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
                let vod_content = document.querySelector('#jq .tab-content')?.text ?? ''
                let vod_pic = document.querySelector('.myui-content__thumb img')?.attributes['data-original'] ?? ''
                let vod_name = document.querySelector('h1.title')?.text ?? ''
                let detList = document.querySelectorAll('p.data') ?? []
                let vod_year = ''
                let vod_director = ''
                let vod_actor = ''
                let vod_area = ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = ''

                for (let index = 0; index < detList.length; index++) {
                    const element = detList[index]
                    if (element.text.includes('分类')) {
                        type_name = element.text.replace('分类：', '')
                    } else if (element.text.includes('导演')) {
                        vod_director = element.text.replace('导演：', '')
                    } else if (element.text.includes('主演')) {
                        vod_actor = element.text.replace('主演：', '')
                    } else if (element.text.includes('地区')) {
                        vod_area = element.text.replace('地区：', '')
                    } else if (element.text.includes('语言')) {
                        vod_lang = element.text.replace('语言：', '')
                    } else if (element.text.includes('年份')) {
                        vod_year = element.text.replace('年份：', '')
                    } else if (element.text.includes('豆瓣')) {
                        vod_douban_score = element.text.replace('豆瓣：', '')
                    }
                }

                let juJiDocment = document.querySelector('#playlist1')?.querySelectorAll('li') ?? []
                let vod_play_url = ''
                for (let index = 0; index < juJiDocment.length; index++) {
                    const element = juJiDocment[index]

                    vod_play_url += element.querySelector('a').text
                    vod_play_url += '$'
                    vod_play_url += element.querySelector('a').attributes['href']
                    vod_play_url += '#'
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
                backData.data = detModel
            }
        } catch (error) {
            backData.error = '获取视频详情失败'
        }

        return JSON.stringify(backData)
    }

    /**
     * 获取视频的播放地址
     * @param {UZArgs} args
     * @returns {Promise<RepVideoPlayUrl>}
     */
    async getVideoPlayUrl(args) {
        let backData = {}
        let reqUrl = this.combineUrl(args.url)
        try {
            const pro = await req(reqUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data

            if (proData) {
                let document = parse(pro.data)
                let script = document.querySelector('.myui-player__box script').text
                console.log(script)
                let url = eval(script.match(/now=(.*);var pn/)[1])
                console.log(url)

                backData.data = url
            }
        } catch (error) {
            backData.error = error
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
        let url = this.removeTrailingSlash(this.webSite) + `/search.php?page=${args.page}&searchword=${args.searchWord}`

        try {
            let resp = await req(url, { headers: this.headers })
            backData.error = resp.error
            let respData = resp.data

            if (respData) {
                let document = parse(respData)
                let allVideo = document.querySelector('#searchList').querySelectorAll('li')
                let videos = []
                for (let index = 0; index < allVideo.length; index++) {
                    const element = allVideo[index]
                    let vodUrl = element.querySelector('a.myui-vodlist__thumb')?.attributes['href'] ?? ''
                    let vodPic = element.querySelector('a.myui-vodlist__thumb')?.attributes['data-original'] ?? ''
                    let vodName = element.querySelector('a.myui-vodlist__thumb')?.attributes['title'] ?? ''
                    let vodDiJiJi = element.querySelector('span.pic-tag')?.text

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
        } catch (e) {
            backData.error = e
        }

        return JSON.stringify(backData)
    }

    ignoreClassName = ['首页', '泰剧', 'APP']

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
var hjkk20240624 = new hjkkClass()
