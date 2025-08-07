'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables, type ChartConfiguration, type Chart as ChartType } from 'chart.js'
import { chartConfig } from '@/lib/chartConfig'

Chart.register(...registerables)

export default function Charts() {
    const areaChartRef = useRef<HTMLCanvasElement>(null)
    const pieChartRef = useRef<HTMLCanvasElement>(null)
    const areaChartInstance = useRef<ChartType | null>(null)
    const pieChartInstance = useRef<ChartType | null>(null)

    useEffect(() => {
        if (areaChartRef.current && pieChartRef.current) {
            const areaCtx = areaChartRef.current.getContext('2d')
            const pieCtx = pieChartRef.current.getContext('2d')

            if (areaCtx && pieCtx) {
                areaChartInstance.current = new Chart(areaCtx, chartConfig.areaChart as ChartConfiguration)
                pieChartInstance.current = new Chart(pieCtx, chartConfig.pieChart as ChartConfiguration)
            }
        }

        return () => {
            if (areaChartInstance.current) {
                areaChartInstance.current.destroy()
                areaChartInstance.current = null
            }
            if (pieChartInstance.current) {
                pieChartInstance.current.destroy()
                pieChartInstance.current = null
            }
        }
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Area Chart</h2>
                <canvas ref={areaChartRef} id="areaChart"></canvas>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">HR employees based on department</h2>
                <canvas ref={pieChartRef} id="pieChart"></canvas>
            </div>
        </div>
    )
}