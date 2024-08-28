/*
 * @description: 
 * @author: pengrenchang
 * @Date: 2024-08-14 10:30:14
 * @LastEditors: pengrenchang
 * @LastEditTime: 2024-08-27 18:28:22
 */

import { useEffect, useRef, useState } from 'react';
import { map, range, toNumber, find, round, divide, minBy, maxBy, some} from "lodash";
import dayjs from "dayjs"; 
import classnames from "classnames";
import { useScroll, useInViewport, useMemoizedFn } from 'ahooks';
import './App.css'

function App() {
    const [dateList, setDateList] = useState([]);
    const [maxTick, setMaxTick] = useState(100);
    const [scale,  setScale] = useState(0);
    const svgRef = useRef(null);
    const tickRef = useRef(null);
    const scroll = useScroll(svgRef);
    const dateRef = useRef([]);
    const numTicks = 49;

    // console.log(scroll, maxTick);
    // 定义函数
    const  generateDateList = (endDate, days) => {
        // 创建日期数组
        const dateList = range(days).map(i => {
            // 使用dayjs往前推日期
            return dayjs(endDate).subtract(i, 'day').format('YYYY-MM-DD')
        }).reverse();
        
        return dateList.map((date, i)=> ({date, tick: 50 + 180 * i}))
    }

    useEffect(() => {
        const dateList_ = generateDateList("2024-08-26", numTicks);
        setMaxTick(dateList_[dateList_.length - 1].tick + 150)
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
    

    console.log(dateList)
    const [inViewport, ratio] = useInViewport(dateRef.current, {
        callback,
        // threshold: [0, 0.25, 0.5, 0.75, 1],
        root: svgRef,
    });

    // const getTop = (n) => {
    //     const top = parseInt(scroll?.top);
    //     console.log(top, (n.tick - top ) % 468)
    //     return  (n.tick - top ) % 468
    // }
    useEffect(()=> {
        if(scroll?.top){
            const top = parseInt(scroll.top);
            setDateList(prev => {
                const arr = prev.filter(n => n.entry?.isIntersecting).map(n => {
                    return  {label: n.date, num: round(divide(n.tick - top + 220 , 2.7), 0)}
                })
                console.log(arr)
                const newArr = adjustSequenceIncreasingDiff(arr)
                console.log(newArr)
                const newDateList = map(prev, (n, index) => {
                    if(some(newArr, i => i.label === n.date)){
                        const newValue = find(newArr, ["label", n.date])?.num
                        
                        return {...n, style: { top: `${newValue}px`  }}
                    }
                    return n
                })
                return newDateList
            })
        }
    }, [scroll]);

    useEffect(() => {
        if (svgRef.current) {
            svgRef.current.scrollTop = maxTick;
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
        </div>
    )
}

export default App
