/*
 * @Author: Lin Ya
 * @Date: 2023-08-18 11:29:47
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-09-28 08:35:50
 * @Description: 调用防抖
 */
/**
 * 函数防抖装饰器
 * @description 创建一个防抖函数，该函数会在延迟时间结束后执行。若在延迟时间内再次调用，则会重新计时。
 * 
 * @template Args - 函数参数类型泛型
 * @param fn - 需要防抖处理的函数
 * @param delay - 延迟时间（毫秒），默认：1000
 * @returns 包装后的防抖函数
 * 
 * @example 基础用法
 * ```typescript
 * const logMessage = debounce((msg: string) => {
 *   console.log(msg);
 * });
 * 
 * logMessage("第一次调用"); // 不会立即执行
 * logMessage("第二次调用"); // 取消第一次，重新计时
 * // 等待1000ms后，只会打印："第二次调用"
 * ```
 * 
 * @example 带参数的函数
 * ```typescript
 * const saveInput = debounce((id: number, value: string) => {
 *   api.save(id, value);
 * }, 500);
 * 
 * input.addEventListener('input', (e) => {
 *   saveInput(1, e.target.value); // 快速输入时只会触发最后一次
 * });
 * ```
 * 
 * @example React中使用
 * ```tsx
 * function SearchBox() {
 *   const [query, setQuery] = useState('');
 *   
 *   const debouncedSearch = useMemo(() => debounce((q: string) => {
 *     searchAPI(q);
 *   }, 300), []);
 * 
 *   useEffect(() => {
 *     debouncedSearch(query);
 *     return () => debouncedSearch.cancel(); // 组件卸载时取消
 *   }, [query]);
 * 
 *   return <input onChange={(e) => setQuery(e.target.value)} />;
 * }
 * ```
 * 
 * @example 类方法防抖
 * ```typescript
 * class Editor {
 *   private debouncedSave = debounce((content: string) => {
 *     this.saveToDB(content);
 *   }, 1000);
 * 
 *   public onContentChange(content: string) {
 *     this.debouncedSave(content);
 *   }
 * 
 *   private saveToDB(content: string) {
 *     // 保存逻辑
 *   }
 * }
 * ```
 */
export function debounce<Args extends any[]>(fn: (...args: Args) => void, delay?: number) {
    // 1.定义一个定时器, 保存上一次的定时器
    let timer: NodeJS.Timeout;


    let delayCount = delay ?? 1000;

    // 2.真正执行的函数
    const _debounce = function (...args: Args) {
        // 取消上一次的定时器
        clearTimeout(timer)
        // 延迟执行
        timer = setTimeout(() => {
            // 外部传入的真正要执行的函数
            fn(...args);
        }, delayCount)
    }

    return _debounce
}

