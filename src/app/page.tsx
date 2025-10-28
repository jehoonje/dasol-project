import BackgroundUploadButton from "../components/BackgroundUploadButton";

export default function HomePage() {
  return (
    <div className="container-60">
      <h1 className="mt-2 mb-3">메인 페이지</h1>
      <p className="mb-4">
        배경 이미지를 업로드하면, 헤더를 포함한 전체 페이지 배경으로 적용됩니다. (기본은 흰색)
      </p>
      <BackgroundUploadButton />
    </div>
  );
}
