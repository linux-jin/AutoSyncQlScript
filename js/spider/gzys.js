// ignore
import { WebApiBase, VideoClass } from '../core/uzCode.js'
import { parse } from 'node-html-parser'
// ignore

class gzysClass extends WebApiBase {
    constructor() {
        super()
        this.webSite = 'https://api.zaqohu.com'
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Content-Type': 'application/json',
        }
        this.ignoreClassName = ['首页']
    }

    async getClassList(args) {
        const webUrl = args.url
        this.webSite = UZUtils.removeTrailingSlash(webUrl)
        let backData = new RepVideoClassList()
        try {
            let ping = await req(webUrl, { headers: { 'User-Agent': this.headers['User-Agent'] } })
            backData.error = ping.error
            let list = []
            let allClass = [
                {
                    type_id: 3,
                    type_name: '电影',
                    hasSubclass: true,
                },
                {
                    type_id: 4,
                    type_name: '电视剧',
                    hasSubclass: true,
                },
                {
                    type_id: 5,
                    type_name: '动漫',
                    hasSubclass: true,
                },
                {
                    type_id: 6,
                    type_name: '综艺',
                    hasSubclass: true,
                },
            ]
            allClass.forEach((e) => {
                let videoClass = new VideoClass()
                videoClass.hasSubclass = true
                videoClass.type_id = e.type_id
                videoClass.type_name = e.type_name
                list.push(videoClass)
            })

            backData.data = list
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
            let ping = await req(this.webSite, { headers: { 'User-Agent': this.headers['User-Agent'] } })
            backData.error = ping.error
            let filter = [
                {
                    name: '分類',
                    list: [
                        { name: '热播电影', id: 3 },
                        { name: 'TC搶先看', id: 19260 },
                        { name: '院線大片', id: 15649 },
                        { name: '網路新片速遞', id: 12814 },
                        { name: 'Netflix最新', id: 15510 },
                        { name: '動作片', id: 9153 },
                        { name: '\u60AC\u7591\u72AF\u7F6A\u7247', id: 12558 },
                        { name: '\u559C\u5267\u7247', id: 14 },
                        { name: '\u60CA\u609A\u6050\u6016\u7247', id: 15511 },
                        { name: '\u79D1\u5E7B\u9B54\u5E7B\u7247', id: 11517 },
                        { name: '\u60C5\u611F\u5267\u60C5\u7247', id: 466 },
                        { name: '\u6218\u4E89\u7247', id: 18046 },
                        { name: '\u8C46\u74E3\u7535\u5F71TOP250', id: 17613 },
                        { name: '\u6296\u97F3\u201C\u6BD2\u820C\u7535\u5F71\u201D\u89E3\u8BF4\u539F\u7247', id: 16215 },
                        { name: '\u5165\u56F4\u5965\u65AF\u5361\u7684LGBT\u7535\u5F71\u7ECF\u5178', id: 17054 },
                        { name: '\u51B7\u95E8\u60AC\u7591\u4F73\u7247Top20', id: 8 },
                        { name: '\u5386\u5C4A\u91D1\u9A6C\u5956\u6700\u4F73\u5F71\u7247', id: 16308 },
                        { name: '\u5386\u5C4A\u91D1\u50CF\u5956\u6700\u4F73\u5F71\u7247', id: 16506 },
                        { name: '\u5386\u5C4A\u5965\u65AF\u5361\u6700\u4F73\u5F71\u7247', id: 16560 },
                    ],
                },
                {
                    name: '分類',
                    list: [
                        { name: '热播电视剧', id: 4 },
                        { name: '\u7231\u4F18\u817E\u8292\u6700\u65B0', id: 16768 },
                        { name: 'Netflix', id: 16540 },
                        { name: '\u6700\u65B0\u65E5\u97E9\u5267', id: 16692 },
                        { name: '\u6E2F\u5267TVB', id: 17473 },
                        { name: '\u6700\u65B0\u7F8E\u5267', id: 16941 },
                        { name: '\u6700\u65B0\u6CF0\u5267', id: 18598 },
                        { name: '\u9AD8\u5206\u60AC\u7591\u72AF\u7F6A\u5267', id: 6611 },
                        { name: '\u9AD8\u5206\u7ECF\u5178\u5927\u9646\u5267', id: 15386 },
                        { name: '\u8FD1\u5E74\u6765\u9AD8\u5206\u53F0\u5267', id: 17084 },
                        { name: '\u300A9\u53F7\u79D8\u4E8B\u300B\u7CFB\u5217', id: 18319 },
                        { name: 'Netflix\u83B7\u5956\u5F71\u7247', id: 18371 },
                    ],
                },
                {
                    name: '分類',
                    list: [
                        { name: '热播动漫', id: 5 },
                        { name: '\u4ECA\u65E5\u4E0A\u65B0', id: 6175 },
                        { name: '\u756A\u5267\u65B0\u70ED\u63A8\u8350', id: 10679 },
                        { name: '\u56FD\u4EA7\u52A8\u6F2B', id: 127 },
                        { name: '\u65E5\u672C\u52A8\u6F2B', id: 446 },
                        { name: '\u6B27\u7F8E\u52A8\u6F2B', id: 128 },
                        { name: '\u52A8\u6F2B\u7535\u5F71', id: 14182 },
                        { name: '\u5165\u7AD9\u5FC5\u8FFD\u2726\u7D2F\u8BA12\u4EBF\u8FFD\u756A', id: 10772 },
                        { name: '\u70ED\u8840\u756A\u5267\u699C', id: 8101 },
                        { name: '\u5947\u5E7B\u756A\u5267\u699C', id: 12655 },
                        { name: '\u300A\u6076\u641E\u4E4B\u5BB6\u300B\u7CFB\u5217', id: 20215 },
                        { name: '\u7403\u7C7B\u8FD0\u52A8\u7CFB\u5217', id: 9282 },
                        { name: '\u706B\u5F71\u5FCD\u8005\u5267\u573A\u7248\u7CFB\u5217', id: 13300 },
                        { name: '\u300A\u95F4\u8C0D\u4E9A\u5951\u300B\u7CFB\u5217', id: 129 },
                        { name: '\u70ED\u8840\u673A\u6218\u7CFB\u5217', id: 6163 },
                    ],
                },
                {
                    name: '分類',
                    list: [
                        { name: '热播综艺', id: 6 },
                        { name: '\u8FD1\u671F\u70ED\u95E8\u7EFC\u827A', id: 6663 },
                        { name: 'NetFlix\u6700\u65B0\u7EFC\u827A', id: 14244 },
                        { name: '\u65E5\u97E9\u6700\u65B0\u7EFC\u827A', id: 7017 },
                        { name: '\u604B\u7231\u751C\u7EFC', id: 8249 },
                        { name: '\u63A8\u7406\u903B\u8F91\u6574\u86CA', id: 8063 },
                        { name: '\u751F\u6D3B\u804C\u573A', id: 8321 },
                        { name: '\u7206\u7B11\u8BED\u8A00\u7EFC\u827A', id: 10119 },
                        { name: '\u660E\u661F\u5927\u96C6\u5408', id: 6757 },
                        { name: '\u97F3\u4E50\u6709\u563B\u54C8', id: 156 },
                        { name: '\u5706\u684C\u6D3E', id: 158 },
                        { name: '\u536B\u89C6\u70ED\u64AD\u7EFC\u827A', id: 9384 },
                    ],
                },
            ]
            let temp
            switch (id) {
                case '3':
                    temp = filter[0]
                    break
                case '4':
                    temp = filter[1]
                    break
                case '5':
                    temp = filter[2]
                    break
                case '6':
                    temp = filter[3]
                    break
            }
            let filterTitle = new FilterTitle()
            filterTitle.name = temp.name
            filterTitle.list = []
            temp.list.forEach((e) => {
                let filterLab = new FilterLabel()
                filterLab.name = e.name
                filterLab.id = String(e.id) // id must be string
                filterTitle.list.push(filterLab)
            })
            backData.data.filter.push(filterTitle)
        } catch (error) {
            backData.error = '获取分类失败～ ' + error
        }
        return JSON.stringify(backData)
    }

    async getSubclassVideoList(args) {
        let backData = new RepVideoList()
        // UZUtils.debugLog(args)
        backData.data = []
        try {
            let listUrl = UZUtils.removeTrailingSlash(this.webSite)
            let params
            if (args.filter[0].id <= 6) {
                listUrl = listUrl + '/H5/Category/GetChoiceList'
                params = { pid: args.filter[0].id, pageSize: 24, page: args.page }
            } else {
                listUrl = listUrl + '/H5/Category/GetModuleList'
                params = { show_id: args.filter[0].id, show_pid: args.mainClassId, pageSize: 24, page: args.page }
            }
            let pro = await req(listUrl, {
                method: 'POST',
                headers: this.headers,
                data: { params: aesEncode(JSON.stringify(params)) },
            })
            let proData = pro.data
            backData.error = pro.error

            let decryptBody = aesDecode(proData.data)
            let obj = JSON.parse(decryptBody)
            let allVideo = obj.list
            let videos = []
            allVideo.forEach((e) => {
                let vodUrl = e.vod_id || ''
                let vodPic = e.c_pic || e.vod_pic
                let vodName = e.c_name || e.vod_name
                let vodDiJiJi = e.vod_continu || ''
                let videoDet = new VideoDetail()
                videoDet.vod_id = +vodUrl
                videoDet.vod_pic = vodPic
                videoDet.vod_name = vodName.trim()
                videoDet.vod_remarks = vodDiJiJi.trim()
                videos.push(videoDet)
            })
            backData.data = videos
        } catch (error) {
            backData.error = '获取视频列表失败～ ' + error
        }

        return JSON.stringify(backData)
    }

    async getVideoDetail(args) {
        let backData = new RepVideoDetail()
        const webUrl = `${this.webSite}/H5/Resource/GetVodInfo`
        try {
            let params = { vod_id: args.url }
            const pro = await req(webUrl, {
                method: 'POST',
                headers: this.headers,
                data: { params: aesEncode(JSON.stringify(params)) },
            })
            backData.error = pro.error
            const proData = pro.data
            if (proData) {
                let obj = JSON.parse(aesDecode(proData.data)).vodInfo
                UZUtils.debugLog(obj)
                let vod_content = obj.vod_use_content
                let vod_pic = obj.pic
                let vod_name = obj.vod_name
                let vod_year = obj.vod_year || ''
                let vod_director = obj.vod_director || ''
                let vod_actor = obj.vod_actor || ''
                let vod_area = obj.vod_area || ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = ''

                // get playlist
                let playlistUrl = `${this.webSite}/H5/Resource/GetOnePlayList`
                let params2 = { vod_id: args.url, pageSize: 10000, page: 1 }
                let res = await req(playlistUrl, {
                    method: 'POST',
                    headers: this.headers,
                    data: { params: aesEncode(JSON.stringify(params2)) },
                })
                let playData = JSON.parse(aesDecode(res.data.data))
                let vod_play_url = playData.urls.map((item) => item.name + '$' + item.url).join('#')

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

        try {
            backData.headers = {
                'User-Agent': this.headers['User-Agent'],
            }
            backData.data = args.url
        } catch (e) {
            UZUtils.debugLog(e)
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }

    async searchVideo(args) {
        let backData = new RepVideoList()
        // 不支持搜尋
        try {
            backData.data = ''
        } catch (e) {
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }
}
let gzys20240822 = new gzysClass()

function aesEncode(str) {
    const key = Crypto.enc.Utf8.parse('181cc88340ae5b2b')
    const iv = Crypto.enc.Utf8.parse('4423d1e2773476ce')

    let encData = Crypto.AES.encrypt(str, key, {
        iv: iv,
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7,
    })
    return encData.ciphertext.toString(Crypto.enc.Hex)
}

function aesDecode(str) {
    const key = Crypto.enc.Utf8.parse('181cc88340ae5b2b')
    const iv = Crypto.enc.Utf8.parse('4423d1e2773476ce')

    str = Crypto.enc.Hex.parse(str)
    return Crypto.AES.decrypt({ ciphertext: str }, key, {
        iv: iv,
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7,
    }).toString(Crypto.enc.Utf8)
}
