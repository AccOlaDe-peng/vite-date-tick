/*
 * @description: 
 * @author: pengrenchang
 * @Date: 2024-08-14 10:30:14
 * @LastEditors: pengrenchang
 * @LastEditTime: 2024-08-29 15:24:18
 */

import { useEffect, useRef, useState } from 'react';
import { map, range, toNumber, find, round, divide, minBy, maxBy, some} from "lodash";
import dayjs from "dayjs"; 
import classnames from "classnames";
import { useScroll, useInViewport, useMemoizedFn } from 'ahooks';
import Draggable from 'react-draggable';
import './App.css'

function App() {
    const [dateList, setDateList] = useState(new Map());
    const [maxTick, setMaxTick] = useState(0);
    const [maxTimeline, setMaxTimeline] = useState(0);
    const [maxTop, setMaxTop] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectId, setSelectId] = useState("");
    const svgRef = useRef(null);
    const tickRef = useRef(null);
    const scroll = useScroll(svgRef);
    const dateRef = useRef([]);
    const numTicks = 50; //时间刻度
    const containerHeight = 468; // 可视区域高度

    const constantHeight = 1000;
    const constantLeft = 400;

    //驱动比例
    const scale = round(maxTop / maxTimeline, 2);
    // 定义函数
    const  generateDateList = (endDate, days) => {
        // 创建日期数组
        const dateList_ = range(days).map(i => {
            // 使用dayjs往前推日期
            return dayjs(endDate).subtract(i, 'day').format('YYYY-MM-DD')
        }).reverse();
        
        return dateList_.map((date, i)=> ({date, tick: 50 + 180 * i, timeline: 5 + 25 * i}))
    }

    useEffect(() => {
        const dateList_ = generateDateList("2024-08-26", numTicks);
        setMaxTick(dateList_[dateList_.length - 1].tick + 150)
        setMaxTimeline(dateList_[dateList_.length - 1].timeline)
        setDateList(prevMap => {
            const newMap = new Map(prevMap);
            dateList_.forEach(n => {
                if (n == "2024-08-25") {
                    newMap.set(n.date, {...n, startTime: [ dayjs("2024-08-25 12:30:30").unix(), [ dayjs("2024-08-25 08:30:30").unix()]]});
                } else {
                    newMap.set(n.date, n);
                }
            });
            return newMap;
        });
    }, [])

    // const callback = useMemoizedFn((entry) => {
    //     setDateList(prevMap => {
    //         const newMap = new Map(prevMap);
    //         return newMap.map(([date, value]) => {
    //             if (toNumber(entry.target.id) === i) {
    //                 return { ...item, entry }
    //             };
    //             return item
    //         })
    //     })
    // });
    const adjustSequenceIncreasingDiff = (arr) =>  {
        const n = arr.length;
        if (n < 2) return arr;
    
        const minValue = minBy(arr, "num").num;
        const maxValue = maxBy(arr, "num").num;
        
        // 初始化新数列
        const b = new Array(n);
        b[0] = {label: arr[0].label, num: minValue}
        b[n - 1] = {label: arr[n-1].label, num: maxValue}
        
        // 计算逐渐递增的差值序列
        // let diff = round((maxValue - minValue) / arr.length, 0); // 递增的基础
        // let diff = (maxValue - minValue) / ((n - 2) * (n - 1) / 2); // 递增的基础
        // console.log(diff)
        let currentDiff = 0;
    
        for (let i = 0; i < n - 2; i++) {
            currentDiff += 8.5 * (i + 1); // 逐渐递增的差值
            b[i + 1] = {label: arr[i + 1].label, num: b[i].num + currentDiff};
        }
        return b;
    }
    
    //获取可拖动高度
    const getScrollHeight = () => {
        if (svgRef.current) {
            return svgRef.current.scrollHeight - 1140;
        }
        return 0
    }

    //设置滑动高度
    const setScrollTop = (scrollTop) => {
        if (svgRef.current) {
            svgRef.current.scrollTop = scrollTop;
        }
    }

    const handleSelect = (e) => {
        console.log(e.currentTarget.getAttribute("data-backup-id"))
    }

    // console.log(dateList)
    // const [inViewport, ratio] = useInViewport(dateRef.current, {
    //     callback,
    //     // threshold: [0, 0.25, 0.5, 0.75, 1],
    //     root: svgRef,
    // });

    const timeHeader = map(range(0, 720 + 15, 15), d => d === 0? "Latest": `${d} Days`);

    const handleDrag = (event, data) => {
        console.log(data.x);
        const scrollHeight = getScrollHeight();
        const slidingDistance = scrollHeight - round(data.x * scale, 0)
        setPosition({ x: data.x, y: 0 });
        setScrollTop(slidingDistance)
    }

    useEffect(()=> {
        if(scroll?.top){
            const top = parseInt(scroll.top, 10);
            //滚动驱使时间轴比例变动
            const slidingDistance = round((maxTop - top) / scale, 0)
            setPosition({ x: slidingDistance, y: 0 })
            //刻度滚动逻辑
            const tickElements = document.querySelectorAll('.tick');
            // console.log(tickElements)
            tickElements.forEach(tick => {
                const initialTop = tick.id;
                const date = tick.getAttribute("data");
                const newTop = initialTop - top; 
                // 获取并打印刻度的滚动位置
                if (date) {
                    // console.log(newTop);
                    // const tickScrollPositionTop = tick.getBoundingClientRect().top - svgRef.current?.getBoundingClientRect().top;
                    // console.log(tick.getBoundingClientRect().top,svgRef.current?.getBoundingClientRect().top, tickScrollPositionTop)
                    // 检查刻度标记是否在视口内
                    if (newTop <= 0) {
                        const tickScrollPositionTop = 0 - svgRef.current?.getBoundingClientRect().top;
                        const tickScrollPositionLeft = 220;
                        setDateList(prevMap => {
                            const newMap = new Map(prevMap);
                            newMap.set(date, { ...prevMap.get(date), style: {display: "none", top: tickScrollPositionTop, left: tickScrollPositionLeft} });
                            return newMap;
                        })
                        // console.log(date, tickScrollPositionTop)
                        // 将刻度标记移动到新的位置
                        // dateList.map(n => {
                        //     if (n.date === date) {
                        //         return {...n, style:{top: }}
                        //     }
                        //     return n
                        // })
                    } else if (newTop > 0 && newTop < constantHeight) { //不知道1000怎么来的。但是实际感受下来就是1000
                        const tickScrollPositionTop = tick.getBoundingClientRect().top - svgRef.current?.getBoundingClientRect().top;
                        const tickScrollPositionLeft = tick.getBoundingClientRect().left / 1.15 + 50;

                        const fontSizeScale = (300 - tickScrollPositionLeft) / 33  + 5;
                        console.log(fontSizeScale)
                        setDateList(prevMap => {
                            const newMap = new Map(prevMap);
                            newMap.set(date, { ...prevMap.get(date), style: {display: "block", top: tickScrollPositionTop, left: tickScrollPositionLeft, fontSize: fontSizeScale + "px" } });
                            return newMap;
                        })
                        // console.log(date, tickScrollPositionTop);
                        // dateList.map(n => {
                        //     if (n.date === date) {
                        //         return {...n, style:{top: }}
                        //     }
                        //     return n
                        // })
                        // 将刻度标记移出视口
                        // tick.style.display = "none";
                    } else {
                        const tickScrollPositionTop = containerHeight - svgRef.current?.getBoundingClientRect().top;
                        const tickScrollPositionLeft = -100;
                        setDateList(prevMap => {
                            const newMap = new Map(prevMap);
                            newMap.set(date, { ...prevMap.get(date), style: {display: "none", top: tickScrollPositionTop, left: tickScrollPositionLeft} });
                            return newMap;
                        })
                    }
                }
                
                // tick.style.top = `${newTop}px`; // 更新位置

            });
            // setDateList(prev => {
            //     const arr = prev.filter(n => n.entry?.isIntersecting).map(n => {
            //         return  {label: n.date, num: round(divide(n.tick - top + 220 , 2.7), 0)}
            //     })
            //     console.log(arr)
            //     const newArr = adjustSequenceIncreasingDiff(arr)
            //     console.log(newArr)
            //     const newDateList = map(prev, (n, index) => {
            //         if(some(newArr, i => i.label === n.date)){
            //             const newValue = find(newArr, ["label", n.date])?.num
                        
            //             return {...n, style: { top: `${newValue}px`  }}
            //         }
            //         return n
            //     })
            //     return newDateList
            // })

            
        }
    }, [scroll]);

    useEffect(() => {
        if (svgRef.current) {
            const scrollHeight = getScrollHeight()
            setScrollTop(scrollHeight)
            setMaxTop(scrollHeight)
        }
    }, [svgRef.current])

    // console.log(inViewport, ratio)

    return (
        <div className="g-container" >
            <div className="master-container">
                <div className="ramp">
                    <div className="racetrack-lanes">
                        <div className="item one"></div>
                        <div className="item two"></div> 
                        <div className="item three"></div>
                        <div className="item four"></div>
                        <div className="item five"></div>   
                    </div>
                    <div className="svg-container" ref={svgRef}>
                        <svg className="og"
                            width="645" height={maxTick} 
                        >
                            <g className="outerg" transform="translate(75,60)"  >
                                <g className="g-box" fill="none" transform="translate(-100,0)">
                                    <path className="domain" stroke="red" d={`M6,0.5H0.5V${maxTick}H6`}></path>
                                    {map([...dateList], ([date, value]) => (<g key={date} className="tick" id={value.tick} transform={`translate(0,${value.tick})`} data={value.date} ref={el => { dateRef.current[date] = el }}>
                                        <line className="tick-line" stroke="#cdcdcd" strokeWidth="4" x2="575" x1="93"></line>
                                        <text className="tick-label" fill="" x="4" dy="0.32em" 
                                        >{value.date}</text>
                                    </g>))}
                                </g>
                            </g>
                        </svg>
                    </div>
                    <div className="markers">
                        {/* {map([...dateList], ([date, value]) => (<div data-date="date" data-backup-id="123" data-backup-name="" className="marker-container selected snapshot" style={{ display: "block", left: "145.57px", top: "233.672px", width: "61.9024px", height: "61.9024px" }} onClick={handleSelect}>
                            <div className="outer-halo"></div>
                            <div className="halo"></div>
                            <div className="marker"></div>
                            <div className="shadow"></div>
                        </div>))} */}
                        <div data-date="" data-backup-id="234" data-backup-name="" className="marker-container snapshot" style={{display: "block", left: "134.57px", top: "312.672px", width: "61.9024px", height: "61.9024px"}} onClick={handleSelect}>
                            <div className="outer-halo"></div>
                            <div className="halo"></div>
                            <div className="marker"></div>
                            <div className="shadow"></div>
                        </div>
                    </div>
                    <div className="dates" ref={tickRef}>
                        {map([...dateList], ([date, value]) => (<div key={date} className="date" style={value?.style}>{date}</div>))}
                    </div>
                </div>
            </div>
            <div className="timeline-wrap">
                <div className="timeline-labels">
                    <div className="timeline-header"></div>
                    <div style={{paddingRight: "5px"}}>
                        <span>Snapshot</span>
                        <span>Dedup</span>
                        <span>Remote Dedup</span>
                        <span>Remote Snapshot</span>
                        <span>OnVault</span>
                    </div>
                </div>
                <div className="timeline-anchor">
                    <div className="timeline-container" style={{ left: 0 }}>
                        <div className="timeline-header">
                            {map(timeHeader, t => <div><span className="timeline-top-arrow"></span>{t}</div>)}
                        </div>
                        <div className="timeline">
                            <div className="svg" style={{float: "left", overflow: "hidden", position: "relative", width: 23914}}>
                                <svg className="graphback" width="1304" height="100" >
                                    <g transform="translate(0,5)">
                                        <g className="tl" transform="translate(10,0)">
                                            <g className="x axis" fontSize="10" transform="translate(0, 70)" fill="none" fontFamily="sans-serif" textAnchor="middle">
                                                <path className="domain" stroke="" d="M0.5,-9V0.5H1304V-9" style={{ display: "none" }}></path>
                                                {map([...dateList], ([date, value]) => (<g key={date} className="tick" transform={`translate(${value.timeline}, 0)`} >
                                                    <line stroke="#3b4046" strokeWidth="3" y2="-70" y1="18"></line>
                                                    <text fill="red" y="-12" dy="0em"></text>
                                                </g>))}
                                            </g>
                                            <circle r="3.5" id="592547" data-type="snapshot" cy="9.35" cx="1205" style={{ fill: "rgb(242, 170, 45)" }}></circle>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <Draggable axis="x" position={position} onDrag={handleDrag} bounds={{left: 0, right: maxTimeline}}>
                                <div className="slider ui-draggable ui-draggable-handle" style={{ width: 150 }}>
                                    <div style={{height: 17, backgroundColor: "#d6d6d7", width: 150, borderRadius: "16px 16px 0 0"}}></div>
                                </div>
                            </Draggable>
                            
                        </div>
                    </div>             
                </div>
            </div>
        </div>
    )
}

export default App
