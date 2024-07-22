// ignore
import { WebApiBase, VideoClass } from '../core/uzCode.js'
import { parse } from 'node-html-parser'
// ignore

class zxzjClass extends WebApiBase {
    webSite = 'https://www.zxzja.com'
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
            const pro = await req(webUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
                },
            })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                var document = parse(proData)
                var allClass = document.querySelectorAll('ul.stui-header__menu > li > a')
                var list = []
                for (let index = 0; index < allClass.length; index++) {
                    const element = allClass[index]
                    var isIgnore = this.isIgnoreClassName(element.text)
                    if (isIgnore) {
                        continue
                    }
                    var type_name = element.text
                    var url = element.attributes['href']
                    url = this.combineUrl(url)
                    // url = url.slice(0, -5)

                    if (url.length > 0 && type_name.length > 0) {
                        var videoClass = new VideoClass()
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

    // async getSubclassList(args) {
    //     var backData = new RepVideoSubclassList()
    //     backData.data = new VideoSubclass()
    //     // const id = args.url
    //     try {
    //         // var url = UZUtils.removeTrailingSlash(this.webSite) + '/show/' + id + '------1.html'
    //         let url = args.url
    //         const pro = await req(url)
    //         backData.error = pro.error
    //         let proData = pro.data
    //         if (proData) {
    //             var document = parse(proData)
    //             var filterTitleList = document.querySelectorAll('#screenbox ul') ?? []
    //             for (let i = 0; i < filterTitleList.length; i++) {
    //                 const element = filterTitleList[i]
    //                 const title = element.querySelector('li span').text
    //                 const items = element.querySelectorAll('.filter-item') ?? []
    //                 // 2-惊悚-中国香港-英语-2022-1-1
    //                 // 分类-类型-地区-语言-年代-排序-页码
    //                 var filterTitle = new FilterTitle()
    //                 filterTitle.name = title.replace(':', '')
    //                 filterTitle.list = []
    //                 for (let j = 0; j < items.length; j++) {
    //                     const item = items[j]
    //                     const name = item.text
    //                     const path = item.attributes['href'] ?? ''
    //                     const regex = /\/show\/(.*?)\.html/
    //                     const match = path.match(regex)
    //                     const parsStr = match ? match[1] : null
    //                     if (parsStr) {
    //                         const parList = parsStr.split('-')
    //                         const id = parList[i + 1]
    //                         var filterLab = new FilterLabel()
    //                         filterLab.name = name
    //                         filterLab.id = id
    //                         filterTitle.list.push(filterLab)
    //                     }
    //                 }

    //                 backData.data.filter.push(filterTitle)
    //             }
    //             if (id === 6 || id === '6') {
    //                 // 短剧
    //                 if (backData.data.filter.length > 0) {
    //                     const list = backData.data.filter[0].list
    //                     var classList = []
    //                     for (let index = 0; index < list.length; index++) {
    //                         const element = list[index]
    //                         var subclass = new VideoClass()
    //                         subclass.type_id = element.id
    //                         subclass.type_name = element.name
    //                         classList.push(subclass)
    //                     }
    //                     backData.data.filter = []
    //                     backData.data.class = classList
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         backData.error = '获取分类失败～ ' + error
    //     }
    //     return JSON.stringify(backData)
    // }
    // /**
    //  * 获取二级分类视频列表 或 筛选视频列表
    //  * @param {UZSubclassVideoListArgs} args
    //  * @returns {@Promise<JSON.stringify(new RepVideoList())>}
    //  */
    // async getSubclassVideoList(args) {
    //     var backData = new RepVideoList()
    //     backData.data = []
    //     try {
    //         var pList = [args.mainClassId]
    //         if (args.filter.length > 0) {
    //             // 筛选
    //             for (let index = 0; index < args.filter.length; index++) {
    //                 const element = args.filter[index]
    //                 pList.push(element.id)
    //             }
    //         } else {
    //             pList.push(args.subclassId)
    //             for (let index = 0; index < 4; index++) {
    //                 pList.push('')
    //             }
    //         }
    //         pList.push(args.page)
    //         var path = pList.join('-')
    //         const url = UZUtils.removeTrailingSlash(this.webSite) + '/show/' + path + '.html'

    //         const pro = await req(url)
    //         backData.error = pro.error
    //         let proData = pro.data
    //         if (proData) {
    //             var document = parse(proData)
    //             var allVideo = document.querySelectorAll('div.module-item') ?? []
    //             var videos = []
    //             for (let index = 0; index < allVideo.length; index++) {
    //                 const element = allVideo[index]
    //                 var vodUrl = element.querySelector('a')?.attributes['href'] ?? ''
    //                 var avaImg = document.querySelector('img.user-avatar-img')?.attributes['src'] ?? ''
    //                 var path = element.querySelector('img')?.attributes['data-original'] ?? ''
    //                 var vodPic = UZUtils.getHostFromURL(avaImg) + path
    //                 var vodName = element.querySelector('img')?.attributes['title'] ?? ''
    //                 var vod_remarks = element.querySelector('div.v-item-bottom > span')?.text ?? element.querySelector('div.v-item-top-left > span')?.text
    //                 if (vodUrl && vodPic && vodName) {
    //                     var video = new VideoDetail()
    //                     video.vod_id = vodUrl
    //                     video.vod_pic = vodPic
    //                     video.vod_name = vodName
    //                     video.vod_remarks = vod_remarks
    //                     videos.push(video)
    //                 }
    //             }
    //             backData.data = videos
    //         }
    //     } catch (error) {
    //         backData.error = '获取视频列表失败～ ' + error
    //     }

    //     return JSON.stringify(backData)
    // }

    /**
     * 获取分类视频列表
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async getVideoList(args) {
        let listUrl = this.removeTrailingSlash(args.url) + '-' + args.page + '.html'
        let backData = new RepVideoList()
        try {
            let pro = await req(listUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
                },
            })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allVideo = document.querySelectorAll('ul.stui-vodlist > li')
                let videos = []
                for (let index = 0; index < allVideo.length; index++) {
                    const element = allVideo[index]
                    let vodUrl = element.querySelector('a.stui-vodlist__thumb')?.attributes['href'] ?? ''
                    let vodPic = element.querySelector('a.stui-vodlist__thumb')?.attributes['data-original'] ?? ''
                    let vodName = element.querySelector('a.stui-vodlist__thumb')?.attributes['title'] ?? ''
                    let vodDiJiJi = element.querySelector('span.pic-text')?.text

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
        var backData = new RepVideoDetail()
        try {
            var webUrl = args.url
            let pro = await req(webUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
                },
            })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                var document = parse(proData)
                var vod_pic = document.querySelector('.stui-content__thumb img')?.attributes['data-original'] ?? ''
                var vod_name = document.querySelector('.stui-content__thumb a')?.attributes['title'] ?? ''
                var detList = document.querySelector('.stui-content__detail')?.querySelectorAll('p') ?? []
                var vod_year = ''
                var vod_director = ''
                var vod_actor = ''
                var vod_area = ''
                var vod_lang = ''
                var vod_douban_score = ''
                var type_name = ''

                let newDetList = []

                detList.forEach((e) => {
                    if (e.text.includes('/')) {
                        let list = e.text.split('/')
                        newDetList = newDetList.concat(list)
                    } else newDetList.push(e.text)
                })

                for (let index = 0; index < newDetList.length; index++) {
                    const element = newDetList[index]
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

                var vod_content = document.querySelector('span.detail-content')?.text ?? ''

                var juJiDocment = document.querySelector('.stui-content__playlist')?.querySelectorAll('a') ?? []

                var vod_play_url = ''
                for (let index = 0; index < juJiDocment.length; index++) {
                    const element = juJiDocment[index]

                    vod_play_url += element.text
                    vod_play_url += '$'
                    vod_play_url += element.attributes['href']
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
        backData.error = ''
        let reqUrl = this.combineUrl(args.url)
        try {
            const pro = await req(reqUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
                },
            })
            backData.error = pro.error
            let proData = pro.data

            if (proData) {
                let document = parse(proData)
                let player = JSON.parse(
                    document
                        .querySelector('.stui-player__video')
                        .toString()
                        .match(/r player_.*?=(.*?)</)[1]
                )
                let url = player.url
                let from = player.from

                if (player.encrypt == '1') {
                    url = decodeURIComponent(url)
                    backData.data = url
                } else if (player.encrypt == '2') {
                    url = decodeURIComponent(atob(url))
                    backData.data = url
                }

                if (/m3u8|mp4/.test(url)) {
                    backData.data = url
                    // } else if (/line3|line4|line5/.test(from)) {
                } else {
                    let ifrwy = await req(url, {
                        headers: {
                            'User-Agent':
                                'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
                            Referer: this.webSite,
                            'sec-fetch-mode': 'navigate',
                            'sec-fetch-site': 'cross-site',
                            'sec-fetch-dest': 'iframe',
                            'upgrade-insecure-requests': 1,
                        },
                    })
                    let ifrwyData = ifrwy.data
                    backData.error = ifrwy.error
                    if (ifrwyData) {
                        let resultv2 = ifrwyData.match(/var result_v2 = {(.*?)};/)[1]
                        let data = JSON.parse('{' + resultv2 + '}').data
                        let code = data.split('').reverse()
                        let temp = ''
                        for (let i = 0x0; i < code.length; i = i + 0x2) {
                            temp += String.fromCharCode(parseInt(code[i] + code[i + 0x1], 0x10))
                        }
                        backData.data = temp.substring(0x0, (temp.length - 0x7) / 0x2) + temp.substring((temp.length - 0x7) / 0x2 + 0x7)
                    }
                }
                // } else {
                //     backData.data = url
                // }
            }
        } catch (error) {
            backData.error = error.message
        }
        // backData.error = ''
        return JSON.stringify(backData)
    }

    /**
     * 搜索视频
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async searchVideo(args) {
        let backData = new RepVideoList()
        // https://www.zxzja.com/vodsearch/%E9%B9%BF----------1---.html
        let url = `${this.removeTrailingSlash(this.webSite)}/vodsearch/${args.searchWord}----------${args.page}---.html`
        try {
            let pro = await req(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
                },
            })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                var document = parse(proData)

                let allVideo = document.querySelector('.stui-vodlist')?.querySelectorAll('li') ?? []
                let videos = []
                for (let index = 0; index < allVideo.length; index++) {
                    const element = allVideo[index]
                    let vodUrl = element.querySelector('a.stui-vodlist__thumb')?.attributes['href'] ?? ''
                    let vodPic = element.querySelector('a.stui-vodlist__thumb')?.attributes['data-original'] ?? ''
                    let vodName = element.querySelector('a.stui-vodlist__thumb')?.attributes['title'] ?? ''
                    let vodDiJiJi = element.querySelector('span.pic-text')?.text

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
            backData.error = e.message
        }

        return JSON.stringify(backData)
    }

    ignoreClassName = ['首页', '专题']

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
var zxzj20240620 = new zxzjClass()
