// import { EmojiObjects } from "@material-ui/icons";
import { color } from "echarts";
import { makeObservable, action, computed, observable } from "mobx";
import authorsData from '../resource/authors.json';
import imagesSizeData from '../resource/img_size.json'
import { ColorStyles, TextTranslate } from "./Categories";

const url = uri => `https://compvis.zjuidg.org${uri}`;  //local version

class Data {
    constructor(root) {
        makeObservable(this);
        this.root = root;
    }

    init() {
        this.resetFilterState();
        this.resetImgState();
        // this.updateSearchedImagesData();
        this.updateFilteredImagesData();
    }

    // @observable.shallow searchData = {//database for search
    //     titleList: titleList,
    //     keywordsList: null,
    //     abstractList: null,
    //     caption: null,
    // }
    @observable.shallow authorsList = authorsData;//database for filtering author
    @observable.shallow imagesSizeData = imagesSizeData;//main database



    @observable.deep dataState = {
        // balanced: false,//heatmap show host/client or not
        selectGalleryImg: false,//show VISImage View or not
        overviewState: 'coOccurrence',
        overviewDetailState: false,
        matrixColor: '#e46366'
    }
    @observable filteredImagesData = {};//a subdataset of imagesData after filtering
    // @observable filteredImagesData = imagesData;//a subdataset of imagesData after filtering
    @observable imgList = [];//list of images' filename
    @observable coOccurrenceData = {};
    // @observable searchWords = null;
    @observable.deep filterState = {}
    @observable imagesYearList = {};//data for timeline view
    @observable filteredVisType = {};
    // @observable filteredClientVisType = {};
    // @observable filteredHostVisType = {};
    @observable detailsBar = {}
    // @observable focusVisType = null;
    @observable imgState = {};
    @observable heatmapData = {};
    @observable heatmapViewData = [];
    @observable indexToClient = {};//map heatmap index data to visType
    @observable indexToHost = {};
    @observable detailsBarData = [];
    @observable searchedAuthorsList = Object.keys(authorsData);
    @observable highlightIndexList = []



    @action resetImgState = () => {//data for VISImage view
        this.imgState = {
            imgId: null,
            caption: null,
            visType: null,
            compType: null,
            title: null,
            authors: null,
            year: null,
            conference: null,
            img_size: null,
            subfigure: null,
            galleryScale: 1,
            viewDimension: {
                width: 1,
                height: 1
            },
            imgSize: {
                width: 1,
                height: 1
            }
        }
    }

    @action resetImagesYearList = () => (
        this.imagesYearList = {
            // 1990: 0,
            // 1991: 0,
            // 1992: 0,
            // 1993: 0,
            // 1994: 0,
            // 1995: 0,
            // 1996: 0,
            // 1997: 0,
            // 1998: 0,
            // 1999: 0,
            // 2000: 0,
            // 2001: 0,
            // 2002: 0,
            // 2003: 0,
            // 2004: 0,
            // 2005: 0,
            2006: 0,
            2007: 0,
            2008: 0,
            2009: 0,
            2010: 0,
            2011: 0,
            2012: 0,
            2013: 0,
            2014: 0,
            2015: 0,
            2016: 0,
            2017: 0,
            2018: 0,
            2019: 0,
            2020: 0,
        });


    @action resetFilterState = () => {
        this.filterState = {
            compType: {//compositionType
                repeated: false,
                stacked: false,
                mirrored: false,
                large_view: false,
                annotated: false,
                coordinated: false,
                accompanied: false,
                nested: false,
                // coOccurrence: false,
            },
            visType: {//visualizationType
                arc_diagram: false,
                area_chart: false,
                bar_chart: false,
                box_plot: false,
                comb: false,
                contour_graph: false,
                chord_diagram: false,
                donut_chart: false,
                error_bar: false,
                flow_diagram: false,
                glyph_based: false,
                graph: false,
                heatmap: false,
                line_chart: false,
                matrix: false,
                map: false,
                others: false,
                parallel_coordinate: false,
                pie_chart: false,
                polar_plot: false,
                proportional_area_chart: false,
                sankey_diagram: false,
                scatterplot: false,
                scivis: false,
                sector_chart: false,
                small_multiple: false,
                storyline: false,
                stripe_graph: false,
                sunburst_icicle: false,
                surface_graph: false,
                table: false,
                tree: false,
                treemap: false,
                unit_visualization: false,
                vector_graph: false,
                word_cloud: false,
            },
            conference: {
                InfoVis: true,
                VAST: true,
                SciVis: true,
                Vis: true,
            },
            authors: this.authorsList,
            years: [2006, 2020],
            searchWords: "",
            filterBarState: {
                compType: 'All',
                visType: 'All',
                conference: 'All',
                authors: 'All',
                searchState: 'Search All'
            },
            filterType: {
                visType: 'and',
                compType: 'and',
                conference: 'or',
                authors: 'or',
            },
            searchState: {
                keywords: true,
                title: true,
                abstract: true,
                // caption: true,
            },
        }
    }

    @action resetFilteredVisType = () => {
        this.filteredVisType = {};
        // this.filteredClientVisType = {};
        // this.filteredHostVisType = {};
    }

    @action resetHeatmapData = () => {
        this.heatmapData = {};
        // //console.log(this.filteredVisType)
        Object.keys(this.filteredVisType).forEach(client => {
            this.heatmapData[client] = {}
            Object.keys(this.filteredVisType).forEach(host => {
                // //console.log(client,host)
                this.heatmapData[client][host] = [];
            })
        })
    }

    @action resetDetailsBar = () => {
        this.detailsBar = {
            show: false,
            type: null,
            visType: null,
            select: null,
        }
    }

    //get gallery images' name list
    @action updateImgList = (client, host) => {
        client = client || null;
        host = host || null;
        if (this.dataState.selectGalleryImg) this.closeSelectedImgState();
        let imgList = this.heatmapData;
        // //console.log(client,host)
        if (client !== null && host !== null) {
            imgList = imgList[client][host]
        } else if (client !== null && host === null) {
            imgList = imgList[client]
        } else if (client === null && host !== null) {
            let hostResult = {}
            Object.keys(this.heatmapData).forEach((nowClient, idx) => {
                Object.keys(this.heatmapData[nowClient]).forEach(nowHost => {
                    if (nowHost !== host) return;
                    if (!(nowHost in hostResult)) hostResult[nowHost] = []
                    hostResult[nowHost] = [...hostResult[nowHost], ...this.heatmapData[nowClient][nowHost]]
                })
            })
            imgList = hostResult
        }

        if (client === null && host === null) {//not use heatmap View(common case)
            this.imgList = Object.keys(this.filteredImagesData).map((key) => {
                return `${key}.png`
            })
        } else if (client === null || host === null) {//use heatmap View's Typebar
            this.imgList = [];
            Object.keys(imgList).forEach(key => {
                this.imgList = this.imgList.concat(imgList[key].map(img => {
                    return `${img}.png`
                }))
            })
            this.imgList = Array.from(new Set(this.imgList))
        } else {//use heatmap View's heatmap or detailsBar
            this.imgList = imgList.map(img => {
                return `${img}.png`
            })
        }
        this.imgList = Array.from(new Set(this.imgList));
    }

    @action updateSearchWords = (value) => {
        this.filterState.searchWords = value;
    }

    // @action updateSearchedImagesData = (value) => {
    @action updateFilteredImagesData = () => {
        // //console.log(this.filterState);
        // let filterState = ['searchState', 'visType', 'compType', 'conference', 'authors'].map(filterType => {
        //     return Object.keys(this.filterState[filterType]).map(detailType => {
        //         if (this.filterState[filterType][detailType]) return detailType;
        //     }).filter(s => {
        //         return s && s.trim();
        //     }).join('&')
        // }).join('s=')

        // let filterValue = ['filterType'].map(key => {
        //     return Object.keys(this.filterState[key]).map(type => {
        //         return this.filterState[key][type]
        //     }).join('&')
        // }).join('v=') + `v=${this.filterState.searchWords}`
        this.searchRequest(this.filterState);
    }

    @action searchRequest = (state) => {
        this.searchedImagesData = fetch(url(`/filter/`), {
            method: 'POST',
            body: JSON.stringify(state)
        })
            .then(res => res.json())
            .then(data => {
                this.coOccurrenceData = data['coOccurrence'];
                delete data['coOccurrence'];
                this.filteredImagesData = data;
                //console.log(Object.keys(this.filteredImagesData))
            }).then(() => {
                // this.updateFilteredImagesData();
                this.updateImagesYearList();
                this.updateHeatmapData();
                this.updateImgList();
            })
    }

    @action getImgDetails = (img_id) => {
        fetch(url(`/img_details/${img_id}`))
            .then(res => res.json())
            .then(data => {
                this.loadData(data)
            }).then(() => {
                this.transformDataFromRaw()
            })
    }

    @action loadData = (data) => {
        this.imgState.visType = data['visType']
        this.imgState.compType = data['compType']
        this.imgState.authors = data['authors']
        this.imgState.caption = data['caption']
        this.imgState.conference = data['conference']
        this.imgState.year = data['year']
        this.imgState.title = data['title']
        this.imgState.doi = data['doi']
        this.imgState.subfiguresRaw = data['subfigures']
        this.imgState.visualizationsRaw = data['visualizations']
        this.imgState.relationsRaw = data['relations']
        this.transformRelationsFromRaw();
    }

    //update timeLine view's data
    @action updateImagesYearList = () => {
        this.resetImagesYearList();
        Object.keys(this.filteredImagesData).forEach(key => {
            this.imagesYearList[this.filteredImagesData[key]['year']] += 1;
            if (this.filteredImagesData[key]['year'] < parseInt(this.filterState.years[0]) ||
                this.filteredImagesData[key]['year'] > parseInt(this.filterState.years[1])) delete this.filteredImagesData[key]
        })
        this.updateFilteredVisType();
    }

    //update heatmap view's data
    @action updateHeatmapData = () => {
        this.resetHeatmapData();
        this.resetDetailsBar();
        this.patternCnt = 0;
        const juxtaposed = ['repeated', 'stacked', 'mirrored']
        const overlaid = ['large_view', 'annotated', 'coordinated', 'accompanied']
        const nested = ['nested']
        const coOccurrence = ['coOccurrence']
        if (document.getElementById('heatmap_wrap'))
            document.getElementById('heatmap_wrap').style.height = '90%';
        // //console.log(this.filteredImagesData)
        if (this.dataState.overviewState === 'coOccurrence') {
            Object.keys(this.coOccurrenceData).forEach(key => {
                this.coOccurrenceData[key].forEach(arr => {
                    if(arr[0] in this.filteredVisType && arr[1] in this.filteredVisType){
                        this.heatmapData[arr[0]][arr[1]].push(key)
                    }
                })
            })
        } else {
            Object.keys(this.filteredImagesData).forEach(key => {
                this.filteredImagesData[key].comp.forEach(arr => {
                    // //console.log(arr)
                    const intersectionLen = (arr1, arr2) => {
                        return arr1.filter(compType => arr2.indexOf(compType) > -1).length
                    }

                    //overview filter
                    if (this.dataState.overviewDetailState !== false) {
                        if (intersectionLen([this.dataState.overviewDetailState], arr[2]) === 0) {
                            return
                        }
                    } else {
                        if (this.dataState.overviewState === 'juxtaposed' && intersectionLen(juxtaposed, arr[2]) === 0) {
                            return
                        } else if (this.dataState.overviewState === 'overlaid' && intersectionLen(overlaid, arr[2]) === 0) {
                            return
                        } else if (this.dataState.overviewState === 'nested' && intersectionLen(nested, arr[2]) === 0) {
                            return
                        }
                    }

                    this.heatmapData[arr[0]][arr[1]].push(key)
                })
            })
        }

        Object.keys(this.heatmapData).forEach(client => {
            Object.keys(this.heatmapData[client]).forEach(host => {
                this.heatmapData[client][host] = Array.from(new Set(this.heatmapData[client][host]))
            })
        })
        this.updateHeatmapViewData();
    }

    //transform heatmapData to apply to echarts
    @action updateHeatmapViewData = () => {
        this.heatmapViewData = [];
        this.indexToClient = {};
        this.indexToHost = {};
        Object.keys(this.heatmapData).forEach((client, cidx) => {
            this.indexToClient[cidx] = client;
            this.heatmapViewData = this.heatmapViewData.concat(Object.keys(this.heatmapData[client]).map((host, hidx) => {
                this.indexToHost[hidx] = host;
                return [cidx, hidx, this.heatmapData[client][host].length];
            }))
        });
    }

    @action updateDetailsBarData = () => {
        this.detailsBarData = [];
        this.heatmapViewData.forEach(arr => {
            const cidx = arr[0];
            const hidx = arr[1];
            const num = arr[2];
            if (!this.detailsBar.show) return;
            if (this.detailsBar.type === 'Child' && this.indexToClient[cidx] === this.detailsBar.visType) {
                this.detailsBarData.push({ num: num, idx: hidx });
            } else if (this.detailsBar.type === 'Parent' && this.indexToHost[hidx] === this.detailsBar.visType) {
                this.detailsBarData.push({ num: num, idx: cidx });
            }
        })
        this.detailsBarData.sort((value1, value2) => {
            if (value1.num > value2.num) return 1;
            else if (value2.num > value1.num) return -1;
            else return 0;
        });
    }

    @action updateFilteredVisType = () => {
        this.resetFilteredVisType();
        if(this.dataState.overviewState === 'coOccurrence'){
            Object.keys(this.coOccurrenceData).forEach(img =>{
                this.coOccurrenceData[img].forEach(comp => {
                    const client = comp[0];
                    const host = comp[1];
                    [client, host].forEach(visType => {
                        // //console.log(client, host)
                        if (!(visType in this.filteredVisType)) this.filteredVisType[visType] = 0
                        // if (this.filterState.visType[visType]) {
                        // //console.log(img, visType)
                        this.filteredVisType[visType] += 1;
                        // }
                    })
                })
            })
        }else{
            Object.keys(this.filteredImagesData).forEach(img => {
                // //console.log(img)
                this.filteredImagesData[img]['comp'].forEach(comp => {
                    const client = comp[0];
                    const host = comp[1];
                    [client, host].forEach(visType => {
                        // //console.log(client, host)
                        if (!(visType in this.filteredVisType)) this.filteredVisType[visType] = 0
                        // if (this.filterState.visType[visType]) {
                        // //console.log(img, visType)
                        this.filteredVisType[visType] += 1;
                        // }
                    })

                })
            })
        }
        //sort
        let tempObject = {}
        Object.keys(this.filteredVisType).sort().forEach(visType => {
            tempObject[visType] = this.filteredVisType[visType];
        })
        this.filteredVisType = tempObject;
    }

    //change filterCard State and displayeds sentence
    @action changeFilterState = (type, value) => {
        if (value === 'All' && this.filterStateSelected(type) !== Object.keys(this.filterState[type]).length) {
            Object.keys(this.filterState[type]).forEach((key) => {
                this.filterState[type][key] = true;
            })
        } else if (value === 'All') {
            Object.keys(this.filterState[type]).forEach((key) => {
                this.filterState[type][key] = false;
            })
        } else if (value !== 'All') {
            this.filterState[type][value] = !this.filterState[type][value];
        }
        if (this.filterStateSelected(type) === Object.keys(this.filterState[type]).length)
            this.filterState.filterBarState[type] = 'All';
        else {
            const searchExpress = 'Part';
            this.filterState.filterBarState[type] = `${searchExpress}`;
        }
        if (type === 'searchState') this.filterState.filterBarState[type] = `Search ${this.filterState.filterBarState[type]}`;
        this.updateFilteredImagesData();
        this.updateImagesYearList();
        this.updateHeatmapData();
        this.updateImgList();
    }

    //count true in filterState
    @action filterStateSelected = (type) => {
        let totalSelected = 0;
        Object.keys(this.filterState[type]).forEach((key) => {
            if (this.filterState.filterType.compType === 'or' && key === 'coOccurrence') {
                totalSelected += 1;
            } else if (this.filterState[type][key]) {
                totalSelected += 1;
            }
        })
        return totalSelected;
    }

    //change the start year and the end year of timeLine
    @action changeFilterYears = (event, newYears) => {
        this.filterState.years = newYears;
    }

    @action changeFilterYearsCommit = () => {
        this.updateFilteredImagesData();
        this.updateImagesYearList();
        this.updateHeatmapData();
        this.updateImgList();
    }

    @action changeFocusVisType = () => {

    }

    @action transformDataFromRaw = () => {
        const img = this.imgState.imgId.split('.')[0];
        const dimensions = this.imgState.viewDimension;
        const imgSize = this.imgState.imgSize;
        ['img_size'].forEach(key => {
            this.imgState[key] = this.imagesSizeData[img][key]
        })
        this.imgState.subfigures = this.imgState.subfiguresRaw.map((raw, i) => {
            const numId = parseInt(raw.id.replace(raw.type + "-", ""));
            return {
                x: (raw.x) / imgSize.width * dimensions.width,
                y: (raw.y) / imgSize.height * dimensions.height,
                width: (raw.width) / imgSize.width * dimensions.width,
                height: (raw.height) / imgSize.height * dimensions.height,
                stroke: '#000000',
                opacity: '0.5',
                dash: [50, 15],
                dashEnable: true,
                strokeWidth: 5,
                id: raw.id,
                numId: numId,
                type: raw.type,
            }
        });
        // this.imgState.visualizations = this.imgState.visualizationsRaw.map((raw, i) => {
        //     const numId = parseInt(raw.id.replace(raw.type + "-", ""));
        //     return {
        //         x: (raw.x) / imgSize.width * dimensions.width,
        //         y: (raw.y) / imgSize.height * dimensions.height,
        //         width: (raw.width) / imgSize.width * dimensions.width,
        //         height: (raw.height) / imgSize.height * dimensions.height,
        //         stroke: ColorStyles[raw.type],
        //         strokeWidth: 5,
        //         id: raw.id,
        //         numId: numId,
        //         type: raw.type,
        //     }
        // });
    }

    @action transformVisualizationsFromRaw = (rel, isBalanced, getRelationType) => {
        let balanced = isBalanced || 'balanced';
        let relationType = rel.relation || getRelationType;
        const dimensions = this.imgState.viewDimension;
        const imgSize = this.imgState.imgSize;
        let tempList = []
        //console.log(relationType)
        const traverseRelation = (relation, visList) => {
            //console.log(relation, typeof (relation))
            if (typeof (relation) === 'string') {
                visList.push(relation)
            } else if (balanced === 'balanced') {
                relation.vislist.forEach(groups => {
                    groups.vislist.forEach(relList => {
                        visList = traverseRelation(relList, visList)
                    })
                })
            } else {
                balanced = 'balanced';
                relation.vislist.forEach(relList => {
                    visList = traverseRelation(relList, visList)
                })
            }
            return visList
        }
        const visList = traverseRelation(rel, tempList);
        //console.log(visList)
        let x, y, x2, y2, flag = false;
        this.imgState.visualizationsRaw.forEach((raw, i) => {
            // //console.log(raw.id,visList.indexOf(raw.id) > -1)
            if (visList.indexOf(raw.id) > -1) {
                if (flag === false) {
                    x = raw.x;
                    y = raw.y;
                    x2 = raw.x + raw.width;
                    y2 = raw.y + raw.height;
                    flag = true;
                } else {
                    x2 = Math.max(x2, raw.x + raw.width)
                    y2 = Math.max(y2, raw.y + raw.height)
                    x = Math.min(x, raw.x)
                    y = Math.min(y, raw.y)
                }
            }
        })
        this.imgState.visualizations = [{
            x: (x) / imgSize.width * dimensions.width,
            y: (y) / imgSize.height * dimensions.height,
            width: (x2 - x) / imgSize.width * dimensions.width,
            height: (y2 - y) / imgSize.height * dimensions.height,
            stroke: ColorStyles[relationType],
            strokeWidth: 5,
            id: 'vis',
            numId: 0,
            type: 'type',
        }]

    }

    @action transformRelationsFromRaw = () => {
        // this.imgState.relations = [];
        // this.imgState.relations['name'] = 'root'
        // //console.log(this.imgState.relationsRaw)
        this.imgState.relations = this.imgState.relationsRaw.map(relation => {
            return relation
        })
        // //console.log(this.imgState.relations)
    }

    //render when select a image in gallery
    @action activeSelectedImgState = (imgId) => {
        this.dataState.selectGalleryImg = true;
        if (imgId !== this.imgState.imgId) {
            this.imgState.subfigures = null;
            this.imgState.visualizations = null;
        }
        this.imgState.imgId = imgId;
        const img = imgId.split('.')[0];
    }

    //close VISImage View
    @action closeSelectedImgState = () => {
        this.dataState.selectGalleryImg = false;
        this.resetImgState();
        document.getElementById('gallery_wrap').style.width = '99%'
    }

    //turn to other VISImage view
    @action changeImgId = (value) => {
        const index = this.imgList.indexOf(this.imgState.imgId);
        const nextIndex = value + index;
        if (nextIndex < 0 || nextIndex >= this.imgList.length) return
        this.imgState.imgId = this.imgList[index + value];
        this.imgState.subfigures = null;
        this.imgState.visualizations = null;
        this.activeSelectedImgState(this.imgState.imgId)
    }

    @action changeFilterType = (type, value) => {
        if (value !== this.filterState.filterType[type]) {
            this.filterState.filterType[type] = value;
            if (value === 'and' && Object.keys(this.filterState[type]).length === this.filterStateSelected(type)
                || (value === 'or' && this.filterStateSelected(type) === 0)) {
                Object.keys(this.filterState[type]).forEach(key => {
                    // if(key === 'coOccurrence')return
                    this.filterState[type][key] = !this.filterState[type][key];
                })
            }
            this.updateFilteredImagesData();
            this.updateImagesYearList();
            this.updateHeatmapData();
            this.updateImgList();
        }
    }

    @action changeOverviewState = (value) => {
        const mapColor = {
            coOccurrence: '#e46366',
            juxtaposed: '#1f77b4',
            overlaid: '#ef8536',
            nested: '#519c3e'
        }
        this.dataState.overviewState = value;
        this.dataState.matrixColor = mapColor[value];
        this.updateFilteredVisType();
        this.updateHeatmapData();
        // this.updateImgList();
    }

    @action updateSearchAuthors = (value) => {
        this.searchedAuthorsList = Object.keys(this.authorsList).map(author => {
            if (author.toLowerCase().indexOf(value.toLowerCase()) >= 0) return author
        }).filter(s => {
            return s && s.trim();
        })
    }

    @action countPatterns = () => {
        let cnt = 0;
        this.imgList.forEach(img_src => {
            const img_id = img_src.split('.')[0]
            this.filteredImagesData[img_id].comp.forEach(comp => {
                if (comp[2].indexOf('coOccurrence') > -1) {
                    cnt += comp[2].length - 1;
                } else {
                    cnt += comp[2].length;
                }
            })
        })
        return cnt
    }

}

export default Data;