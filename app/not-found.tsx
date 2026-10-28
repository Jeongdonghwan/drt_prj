import Link from 'next/link';
export default function NotFound() {
  return <main className="wrap content page-top"><h1 className="page-title">페이지를 찾을 수 없습니다</h1><p><Link href="/">도로시펫 홈으로</Link></p></main>;
}
