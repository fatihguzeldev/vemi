import { SourceLines } from '../components/SourceLines'
import { tourSourceLines } from '../data/tour'

export function SourceStep() {
  return <SourceLines lines={tourSourceLines} animate />
}
