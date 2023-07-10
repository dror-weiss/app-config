import { getOptions } from 'loader-utils';
type LoaderContext = Parameters<typeof getOptions>[0];
interface Loader extends LoaderContext {
}
declare const loader: (this: Loader) => void;
export default loader;
export declare const regex: RegExp;
