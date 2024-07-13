// ignore
import { WebApiBase, VideoClass } from '../core/uzCode.js'
import { parse } from 'node-html-parser'
// ignore

class tiantianClass extends WebApiBase {
    webSite = 'http://op.ysdqjs.cn'
    headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    }
    cookie = ''
    parseMap = {}

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
            let classes = []
            let res = await this.postData(this.webSite + '/v2/type/top_type')
            backData.error = res.error
            let resJson = res.data
            if (resJson) {
                for (let data of resJson['data']['list']) {
                    let type_name = data.type_name
                    let type_id = data.type_id.toString()
                    let videoClass = new VideoClass()
                    videoClass.type_id = type_id
                    videoClass.type_name = type_name
                    classes.push(videoClass)
                }
            }

            backData.data = classes
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
        const limit = 12
        const param = {
            type_id: args.url,
            page: args.page,
            limit: limit,
        }
        let backData = new RepVideoList()
        try {
            let res = await this.postData(this.webSite + '/v2/home/type_search', param)
            backData.error = res.error
            let resJson = res.data
            if (resJson) {
                let allVideo = resJson.data.list
                let videos = []
                allVideo.forEach((e) => {
                    let videoDet = {}
                    videoDet.vod_id = e.vod_id
                    videoDet.vod_pic = e.vod_pic
                    videoDet.vod_name = e.vod_name
                    videoDet.vod_remarks = e.vod_remarks
                    videos.push(videoDet)
                })

                backData.data = videos
            }
        } catch (e) {
            backData.error = '获取列表失败～' + e.message
        }
        return JSON.stringify(backData)
    }

    /**
     * 获取视频详情
     * @param {UZArgs} args
     * @returns {Promise<RepVideoDetail>}
     */
    async getVideoDetail(args) {
        const param = {
            vod_id: args.url,
        }
        let backData = new RepVideoDetail()
        try {
            let res = await this.postData(this.webSite + '/v2/home/vod_details', param)
            backData.error = res.error
            let resJson = res.data
            if (resJson) {
                let obj = resJson.data
                let detModel = new VideoDetail()
                detModel.vod_year = obj.vod_year ?? ''
                detModel.type_name = obj.type_name ?? ''
                detModel.vod_director = obj.vod_director ?? ''
                detModel.vod_actor = obj.vod_actor ?? ''
                detModel.vod_area = obj.vod_area ?? ''
                detModel.vod_lang = obj.vod_lang ?? ''
                detModel.vod_douban_score = obj.vod_douban_score ?? ''
                detModel.vod_content = this.formatContent(obj.vod_content) ?? ''
                detModel.vod_pic = obj.vod_pic ?? ''
                detModel.vod_name = obj.vod_name ?? ''
                // detModel.vod_play_url = vod_play_url
                // detModel.vod_play_from = vod_play_from
                detModel.vod_id = obj.vod_id

                const playInfo = obj.vod_play_list
                const playVod = {}
                playInfo.forEach((obj) => {
                    const sourceName = obj.name
                    let playList = ''
                    const videoInfo = obj.urls
                    const parse = obj.parse_urls
                    if (parse && parse.length > 0) this.parseMap[sourceName] = parse

                    const vodItems = videoInfo.map((epObj) => {
                        const epName = epObj.name
                        const playUrl = sourceName + '@@' + epObj.url
                        return epName + '$' + playUrl
                    })

                    if (vodItems.length === 0) return
                    playList = vodItems.join('#')
                    playVod[sourceName] = playList
                })
                detModel.vod_play_from = Object.keys(playVod).join('$$$')
                detModel.vod_play_url = Object.values(playVod).join('$$$')

                backData.data = detModel
            }
        } catch (e) {
            backData.error = '获取视频详情失败' + e.message
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
        let sourceName = args.url.split('@@')[0]
        let url = args.url.split('@@')[1]
        let parsers = this.parseMap[sourceName]
        if (parsers) {
            for (const parser of parsers) {
                if (!parser) continue
                try {
                    const resp = await this.request(parser + url)
                    backData.error = resp.error
                    const json = resp.data
                    if (json.url) {
                        backData.data = json.url
                        break
                    } else backData.error = '解析失敗'
                } catch (e) {
                    backData.error = e.message
                }
            }
        }
        return JSON.stringify(backData)
    }

    /**
     * 搜索视频
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async searchVideo(args) {
        const limit = 12
        const param = {
            keyword: args.searchWord,
            page: args.page,
            limit: limit,
        }
        let backData = new RepVideoList()

        try {
            let res = await this.postData(this.webSite + '/v2/home/search', param)
            backData.error = res.error
            let resJson = res.data
            if (resJson) {
                let allVideo = resJson.data.list
                let videos = []
                allVideo.forEach((e) => {
                    let videoDet = {}
                    videoDet.vod_id = e.vod_id
                    videoDet.vod_pic = e.vod_pic
                    videoDet.vod_name = e.vod_name
                    videoDet.vod_remarks = e.vod_remarks
                    videos.push(videoDet)
                })

                backData.data = videos
            }
        } catch (e) {
            backData.error = '获取列表失败～' + e.message
        }

        return JSON.stringify(backData)
    }

    ignoreClassName = ['首页', '留言求片', '发布页', 'App']

    async postData(url, data) {
        const timestamp = Math.floor(new Date().getTime() / 1000)
        const key = 'kj5649ertj84ks89r4jh8s45hf84hjfds04k'
        const sign = Crypto.MD5(key + timestamp).toString()
        let defaultData = {
            sign: sign,
            timestamp: timestamp,
        }
        const reqData = data ? Object.assign({}, defaultData, data) : defaultData
        return await this.request(url, 'post', reqData)
    }

    async request(reqUrl, method, data) {
        const headers = {
            'User-Agent': this.headers['User-Agent'],
        }
        if (this.cookie) {
            headers['Cookie'] = this.cookie
        }
        const postType = method === 'post' ? 'form-data' : ''
        let res = await req(reqUrl, {
            method: method || 'get',
            headers: headers,
            data: data,
            postType: postType,
        })
        if (res.code === 403) {
            const path = res.data.match(/window\.location\.href ="(.*?)"/)[1]
            this.cookie = Array.isArray(res.headers['set-cookie'])
                ? res.headers['set-cookie'].join(';')
                : res.headers['set-cookie']
            headers['Cookie'] = this.cookie
            res = await req(this.siteUrl + path, {
                method: method || 'get',
                headers: headers,
                data: data,
                postType: postType,
            })
        }
        return res
    }

    // generateParam(tid, pg, extend, limit) {
    //     const param = {
    //         type_id: tid,
    //         page: pg,
    //         limit: limit
    //     }
    //     if (extend['extend'] !== undefined && extend['extend'] !== '全部') {
    //         param.class = extend['extend']
    //     }
    //     if (extend['area'] !== undefined && extend['area'] !== '全部') {
    //         param.area = extend.area
    //     }
    //     if (extend['lang'] !== undefined && extend['lang'] !== '全部') {
    //         param.lang = extend.lang
    //     }
    //     if (extend['year'] !== undefined && extend['year'] !== '全部') {
    //         param.year = extend.year
    //     }
    //     return param
    // }

    formatContent(content) {
        return content
            .replaceAll('&amp;', '&')
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>')
            .replaceAll('&quot;', '"')
            .replaceAll(/<\/?[^>]+>/g, '')
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
var tiantian20240629 = new tiantianClass()
