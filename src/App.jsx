/*
 * @description: 
 * @author: pengrenchang
 * @Date: 2024-08-14 10:30:14
 * @LastEditors: pengrenchang
 * @LastEditTime: 2024-08-28 18:24:17
 */

import { useEffect, useRef, useState } from 'react';
import { map, range, toNumber, find, round, divide, minBy, maxBy, some} from "lodash";
import dayjs from "dayjs"; 
import classnames from "classnames";
import { useScroll, useInViewport, useMemoizedFn } from 'ahooks';
import Draggable from 'react-draggable';
import './App.css'

function App() {
    const [dateList, setDateList] = useState([]);
    const [maxTick, setMaxTick] = useState(0);
    const [maxTimeline, setMaxTimeline] = useState(0);
    const [maxTop, setMaxTop] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);
    const tickRef = useRef(null);
    const scroll = useScroll(svgRef);
    const dateRef = useRef([]);
    const numTicks = 50;

    //驱动比例
    const scale = round(maxTop / maxTimeline, 2);
    // 定义函数
    const  generateDateList = (endDate, days) => {
        // 创建日期数组
        const dateList = range(days).map(i => {
            // 使用dayjs往前推日期
            return dayjs(endDate).subtract(i, 'day').format('YYYY-MM-DD')
        }).reverse();
        
        return dateList.map((date, i)=> ({date, tick: 50 + 180 * i, timeline: 5 + 25 * i}))
    }

    useEffect(() => {
        const dateList_ = generateDateList("2024-08-26", numTicks);
        setMaxTick(dateList_[dateList_.length - 1].tick + 150)
        setMaxTimeline(dateList_[dateList_.length - 1].timeline)
        setDateList(dateList_);
    }, [])

    const callback = useMemoizedFn((entry) => {
        setDateList(prev => {
            return prev.map((item, i) => {
                if (toNumber(entry.target.id) === i) {
                    return { ...item, entry }
                };
                return item
            })
        })
    });
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

    // console.log(dateList)
    const [inViewport, ratio] = useInViewport(dateRef.current, {
        callback,
        // threshold: [0, 0.25, 0.5, 0.75, 1],
        root: svgRef,
    });

    const timeHeader = map(range(0, 720 + 15, 15), d => d === 0? "Latest": `${d} Days`);

    const handleDrag = (event, data) => {
        console.log(data.x);
        const scrollHeight = getScrollHeight();
        const slidingDistance = scrollHeight - round(data.x * scale, 0)
        setPosition({ x: data.x, y: 0 });
        setScrollTop(slidingDistance)

    }

    // const getTop = (n) => {
    //     const top = parseInt(scroll?.top);
    //     console.log(top, (n.tick - top ) % 468)
    //     return  (n.tick - top ) % 468
    // }
    useEffect(()=> {
        if(scroll?.top){
            const top = parseInt(scroll.top, 10);
            //滚动驱使时间轴比例变动
            const slidingDistance = round((maxTop - top) / scale, 0)
            setPosition({ x: slidingDistance, y: 0 })
            //刻度滚动逻辑
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
                                    {dateList.map((n, index) => (<g key={n.date} className="tick" id={index} transform={`translate(0,${n.tick})`} ref={el => { dateRef.current[index] = el }}>
                                            <line className="tick-line" stroke="#cdcdcd" strokeWidth="4" x2="575" x1="93"></line>
                                            <text className="tick-label" fill="red" x="4" dy="0.32em" 
                                            // transform='translateZ(200px) rotateX(-79deg)'
                                            >{n.date}</text>
                                        </g>))
                                    }
                                </g>
                            </g>
                        </svg>
                    </div>
                    <div className="dates" ref={tickRef}>
                        {map(dateList, (n, index) => (<div key={n.date} className={classnames({["date"]: true, ['hidden']: !n.entry?.isIntersecting})} style={n?.style}>{n.date}</div>))}
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
                                                {dateList.map((n, index) => (<g key={n.date} className="tick" transform={`translate(${n.timeline}, 0)`} >
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
