/*
 * @description: 
 * @author: pengrenchang
 * @Date: 2024-08-14 10:30:14
 * @LastEditors: pengrenchang
 * @LastEditTime: 2024-08-27 18:28:22
 */

import { useEffect, useRef, useState } from 'react';
import { map, range, toNumber } from "lodash";
import dayjs from "dayjs"; 
import classnames from "classnames";
import { useScroll, useInViewport, useMemoizedFn } from 'ahooks';
import './App.css'

function App() {
    const [dateList, setDateList] = useState([]);
    const [maxTick, setMaxTick] = useState(100);
    const svgRef = useRef(null);
    const tickRef = useRef(null);
    const scroll = useScroll(svgRef);
    const dateRef = useRef([]);
    const numTicks = 49;

    console.log(scroll, maxTick);
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
        setMaxTick(dateList_[dateList_.length - 1].tick + 50)
        setDateList(dateList_);
       
    }, [])

    const callback = useMemoizedFn((entry) => {
        console.log(entry.target.id)
        setDateList(prev => {
            return prev.map((item, i) => {
                if (toNumber(entry.target.id) === i) {
                    return { ...item, entry }
                };
                return item
            })
        })
    });
        // if (entry.isIntersecting) {
        //   const active = entry.target.getAttribute('id') || '';
        //   setActiveMenu(active);
        // }
    // });
    console.log(dateList)
    const [inViewport, ratio] = useInViewport(dateRef.current, {
        callback,
        // threshold: [0, 0.25, 0.5, 0.75, 1],
        root: svgRef,
    });

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
                                            <text className="tick-label" fill="" x="4" dy="0.32em">{n.date}</text>
                                        </g>))
                                    }
                                </g>
                            </g>
                        </svg>
                    </div>
                    <div className="dates" ref={tickRef}>
                        {map(dateList, (n, index) => (<div key={n.date} className={classnames({["date"]: true, ['hidden']: !n.entry?.isIntersecting})} style={{ top: `${index * 10}px` }}>{n.date}</div>))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
