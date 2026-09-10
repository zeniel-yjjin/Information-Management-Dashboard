const { useState, useMemo, useRef } = React;

/* ------------------------------------------------------------------ */
/* 상수                                                                  */
/* ------------------------------------------------------------------ */

const STATUS = {
  excellent: { label: "우수", color: "#1E9E6B", soft: "#E4F6EE" },
  good: { label: "보통", color: "#C98A1F", soft: "#FBF2DE" },
  poor: { label: "미흡", color: "#D14343", soft: "#FBE7E7" },
};

/* ------------------------------------------------------------------ */
/* 개선 방안 라이브러리 (영역별 — 교육이 아니라 실제 조치 중심)                    */
/* ------------------------------------------------------------------ */

const IMPROVEMENT_LIBRARY = [
  {
    keywords: ["수집"],
    area: "수집",
    measures: [
      { title: "수집 항목 최소화", detail: "채용·업무 서류 양식에서 가족관계·재산·출신지역 등 불필요한 개인정보 요청 항목을 삭제하세요." },
      { title: "동의서 갱신", detail: "최신 개인정보 수집·이용 동의서 양식으로 교체하고, 기존 서류에 서명 여부를 재확인하세요." },
      { title: "보관함 시건장치 설치", detail: "수집된 서류는 잠금장치가 있는 캐비닛에 보관하고, 열쇠·비밀번호 관리자를 지정하세요." },
    ],
  },
  {
    keywords: ["pc", "컴퓨터"],
    area: "PC",
    measures: [
      { title: "보안 프로그램 점검", detail: "백신·보안 프로그램이 설치되어 있고 최신 상태인지 확인하고, 미설치 PC는 즉시 설치하세요." },
      { title: "화면 자동잠금 설정", detail: "자리비움 시 5분 이내 자동으로 화면이 잠기도록 전 직원 PC 설정을 변경하세요." },
      { title: "저장 위치 이전", detail: "개인 클라우드나 외장 USB에 저장된 자료를 지정 저장소(사내 서버·NAS)로 옮기세요." },
      { title: "계정 관리 강화", detail: "공유 계정 사용을 중단하고, 개인별 계정과 복잡도 기준을 충족하는 비밀번호를 적용하세요." },
    ],
  },
  {
    keywords: ["문서"],
    area: "문서",
    measures: [
      { title: "보관 방식 즉시 개선", detail: "개인정보가 포함된 서류를 잠금장치가 있는 캐비닛으로 지금 바로 옮기세요." },
      { title: "문서 관리대장 작성", detail: "서류의 반출입 내역을 기록하는 관리대장을 만들고 담당자를 지정하세요." },
      { title: "사용 후 즉시 회수", detail: "회의·업무에 사용한 출력물은 그 자리에서 바로 회수하거나 파쇄하는 절차를 만드세요." },
    ],
  },
  {
    keywords: ["전송"],
    area: "전송",
    measures: [
      { title: "전송 파일 암호화", detail: "개인정보가 담긴 파일은 압축 후 비밀번호를 설정해 전송하도록 절차를 바꾸세요." },
      { title: "수신자 재확인 절차 도입", detail: "전송 전 수신자 이메일 주소·단체방 구성원을 한 번 더 확인하는 체크 절차를 넣으세요." },
      { title: "개인 메신저 사용 금지 공지", detail: "개인 메신저·개인 휴대전화로 개인정보를 촬영·전달하지 않도록 부서에 공지하세요." },
    ],
  },
  {
    keywords: ["파기"],
    area: "파기",
    measures: [
      { title: "파기대장 작성", detail: "파기 일시·방법·담당자를 기록하는 파기대장을 만들어 운영하세요." },
      { title: "파쇄 수단 확보", detail: "문서 파쇄기를 비치하거나, 인증된 외부 파쇄업체와 계약을 체결하세요." },
      { title: "전자파일 완전삭제 적용", detail: "단순 삭제가 아닌, 복구 불가능한 전용 삭제 프로그램으로 전자파일을 처리하세요." },
    ],
  },
  {
    keywords: ["교육"],
    area: "교육",
    measures: [
      { title: "재교육 일정 수립", detail: "미이수자를 대상으로 가까운 시일 내 재교육 일정을 확정하고 공지하세요." },
      { title: "이수 현황 관리대장 작성", detail: "교육 이수 여부를 명단으로 관리하고, 미이수자에게 개별 알림을 발송하세요." },
      { title: "핵심 요약자료 배포", detail: "정식 교육 전이라도 핵심 수칙을 정리한 요약자료나 영상을 먼저 공유하세요." },
    ],
  },
  {
    keywords: ["사고"],
    area: "사고",
    measures: [
      { title: "신고 체계 게시", detail: "개인정보 유출 의심 시 신고할 연락처와 절차를 사무실 내 잘 보이는 곳에 게시하세요." },
      { title: "초동조치 매뉴얼 배포", detail: "유출 의심 정황 발견 시 추가 확산을 막는 초기 조치 방법을 문서로 정리해 배포하세요." },
      { title: "모의훈련 실시", detail: "연 1회 이상 유출 대응 모의훈련을 진행해 실제 상황에서 절차가 작동하는지 점검하세요." },
    ],
  },
];

const DEFAULT_IMPROVEMENT = (area) => ({
  area,
  measures: [
    { title: "원인 파악", detail: `${area} 항목이 미이행된 구체적인 원인을 담당자와 함께 확인하세요.` },
    { title: "개선 조치 시행", detail: "확인된 원인에 맞는 조치를 실행하고, 처리 결과를 기록으로 남기세요." },
    { title: "재점검 일정 확정", detail: "다음 점검 전까지 개선이 완료됐는지 확인할 일정을 미리 잡아두세요." },
  ],
});

function matchImprovement(area) {
  const a = String(area || "").trim();
  const found = IMPROVEMENT_LIBRARY.find((t) =>
    t.keywords.some((k) => a.toLowerCase().includes(k.toLowerCase()))
  );
  return found || DEFAULT_IMPROVEMENT(a || "기타");
}

/* ------------------------------------------------------------------ */
/* 유틸                                                                  */
/* ------------------------------------------------------------------ */

function round1(n) {
  return Math.round(n * 10) / 10;
}

function classifyDept(rate) {
  if (rate >= 100) return "excellent";
  if (rate >= 70) return "good";
  return "poor";
}

function classifyRate(rate) {
  if (rate >= 100) return "excellent";
  if (rate >= 70) return "good";
  return "poor";
}

/* ------------------------------------------------------------------ */
/* 엑셀 파싱 — 자가진단 체크리스트 서식 전용                                    */
/* ------------------------------------------------------------------ */

function cellStr(v) {
  return v === undefined || v === null ? "" : String(v).trim();
}

function parseChecklistSheet(rows, fileName) {
  let siteName = "";
  let siteLabelWord = "현장/부서";
  let examDate = "";
  let inspector = "";
  let headcount = "";

  let headerRowIdx = -1;
  let col = {};

  rows.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const s = cellStr(cell);
      if (!s) return;
      const next = cellStr(row[cIdx + 1]);
      if (s.includes("점검일자") && next) examDate = next;
      else if ((s.includes("점검부서") || s.includes("점검현장")) && next) {
        siteName = next;
        siteLabelWord = s.includes("현장") ? "현장" : "부서";
      } else if (s.includes("점검자") && next) inspector = next;
      else if (s.includes("점검인원") && next) headcount = next;

      if (s === "번호" && headerRowIdx === -1) {
        headerRowIdx = rIdx;
      }
    });
  });

  if (headerRowIdx === -1) {
    throw new Error("체크리스트 표(번호/영역/응답 열)를 찾지 못했습니다.");
  }

  const headerRow = rows[headerRowIdx];
  headerRow.forEach((cell, idx) => {
    const s = cellStr(cell);
    if (!s) return;
    if (s === "번호") col.no = idx;
    else if (s === "영역") col.area = idx;
    else if (s.includes("점검") && s.includes("항목")) col.item = idx;
    else if (s === "응답") col.answer = idx;
    else if (s.includes("사유") || (s.includes("개선") && s.includes("계획")))
      col.reason = idx;
    else if (s.includes("예정일")) col.due = idx;
  });

  if (col.area === undefined || col.answer === undefined) {
    throw new Error("체크리스트 열 구성을 인식하지 못했습니다.");
  }

  const items = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const noVal = col.no !== undefined ? row[col.no] : undefined;
    const no = parseInt(noVal, 10);
    if (isNaN(no)) break;

    const area = cellStr(row[col.area]) || "기타";
    const text = col.item !== undefined ? cellStr(row[col.item]) : "";
    const answerRaw = col.answer !== undefined ? cellStr(row[col.answer]) : "";
    let answer = "해당없음";
    if (answerRaw.includes("아니")) answer = "아니오";
    else if (answerRaw === "예" || answerRaw.includes("예")) answer = "예";

    const reason = col.reason !== undefined ? cellStr(row[col.reason]) : "";
    const due = col.due !== undefined ? cellStr(row[col.due]) : "";

    items.push({ no, area, text, answer, reason, due });
  }

  if (!items.length) {
    throw new Error("점검 문항 데이터를 찾지 못했습니다.");
  }

  const counted = items.filter((i) => i.answer === "예" || i.answer === "아니오");
  const yesCount = counted.filter((i) => i.answer === "예").length;
  const rate = counted.length ? round1((yesCount / counted.length) * 100) : 0;
  const grade = classifyDept(rate);

  const areaOrder = [];
  items.forEach((i) => {
    if (!areaOrder.includes(i.area)) areaOrder.push(i.area);
  });

  const areaStats = {};
  areaOrder.forEach((a) => {
    const areaItems = items.filter((i) => i.area === a);
    const areaCounted = areaItems.filter((i) => i.answer === "예" || i.answer === "아니오");
    const areaYes = areaCounted.filter((i) => i.answer === "예").length;
    const areaNo = areaCounted.length - areaYes;
    const areaRate = areaCounted.length ? round1((areaYes / areaCounted.length) * 100) : null;
    areaStats[a] = { rate: areaRate, yes: areaYes, no: areaNo, total: areaCounted.length };
  });

  return {
    name: siteName || fileName.replace(/\.(xlsx|xls)$/i, ""),
    siteLabelWord,
    examDate,
    inspector,
    headcount,
    items,
    areas: areaOrder,
    areaStats,
    rate,
    grade,
    yesCount,
    noCount: counted.length - yesCount,
    failedItems: items.filter((i) => i.answer === "아니오"),
  };
}

function readWorkbookFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        const dept = parseChecklistSheet(rows, file.name);
        resolve(dept);
      } catch (err) {
        reject({ fileName: file.name, message: err.message || "분석 실패" });
      }
    };
    reader.onerror = () => reject({ fileName: file.name, message: "파일을 읽을 수 없습니다." });
    reader.readAsArrayBuffer(file);
  });
}

/* ------------------------------------------------------------------ */
/* 하위 컴포넌트                                                          */
/* ------------------------------------------------------------------ */

function StatusBadge({ status, size = "md" }) {
  const s = STATUS[status];
  return (
    <span className={`badge badge-${size}`} style={{ color: s.color, background: s.soft, borderColor: s.color }}>
      {s.label}
    </span>
  );
}

function Bar({ value }) {
  if (value === null || value === undefined) {
    return <span className="bar-na mono">해당없음</span>;
  }
  const color = STATUS[classifyRate(value)].color;
  return (
    <div className="bar">
      <div className="bar__track">
        <div className="bar__fill" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
      <span className="bar__value mono">{value}%</span>
    </div>
  );
}

function Donut({ yes, no }) {
  const total = yes + no;
  const yesPct = total ? (yes / total) * 100 : 0;
  const yesColor = STATUS.excellent.color;
  const noColor = STATUS.poor.color;
  const gradient = `conic-gradient(${yesColor} 0% ${yesPct}%, ${noColor} ${yesPct}% 100%)`;
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: total ? gradient : "#DDE2E8" }}>
        <div className="donut__hole">
          <span className="mono donut__pct">{total ? round1(yesPct) : 0}%</span>
          <span className="donut__label">예 비율</span>
        </div>
      </div>
    </div>
  );
}

function UploadScreen({ onFile, error, isDragging, setIsDragging }) {
  const inputRef = useRef(null);
  return (
    <div className="upload-screen">
      <div className="upload-screen__ledger" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="ledger-row" key={i}>
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="ledger-line" />
          </div>
        ))}
      </div>

      <div className="upload-screen__content">
        <div className="eyebrow">사내 개인정보 · 정보보안 자가진단</div>
        <h1>정보관리 점검 분석 시스템</h1>
        <p className="lede">
          현장 또는 부서의 자가진단 체크리스트(.xlsx) 1부를 업로드하면 이행률·등급을
          자동 산정하고, 미이행 항목에 대한 구체적인 개선 방안을 함께 제공합니다.
        </p>

        <div
          className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
          onClick={() => inputRef.current && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              onFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="dropzone__icon">📁</div>
          <p className="dropzone__title">파일을 여기로 끌어오거나 클릭해 업로드</p>
          <p className="dropzone__sub">.xlsx 형식 · 1개 파일</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
          />
        </div>

        {error && (
          <div className="upload-error">
            <span>⚠️</span>
            <span>{error.fileName}: {error.message}</span>
          </div>
        )}

        <div className="upload-screen__footer">
          <p className="hint">
            현장용/부서용 서식은 용어(현장·부서)만 다를 뿐 문항 구조는 동일하게 인식됩니다.
            '아니오'로 응답한 문항은 부서가 작성한 개선계획과 함께 구체적인 개선 방안 여러 가지를 안내합니다.
            업로드한 파일은 이 브라우저 안에서만 처리되며, 어디에도 저장되거나 전송되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function ImprovementCard({ item }) {
  const improvement = matchImprovement(item.area);
  return (
    <div className="guide-card">
      <div className="guide-card__head">
        <div>
          <span className="guide-card__area">{item.area}</span>
          <span className="guide-card__title">No.{item.no} {item.text}</span>
        </div>
        <StatusBadge status="poor" />
      </div>

      {(item.reason || item.due) && (
        <div className="dept-note">
          <span className="dept-note__label">부서 작성 개선계획</span>
          <p>{item.reason || "작성된 개선계획이 없습니다."}</p>
          {item.due && <span className="dept-note__due">개선 예정일 {item.due}</span>}
        </div>
      )}

      <div className="measure-block">
        <div className="measure-block__head">💡 추천 개선 방안</div>
        <div className="measure-list">
          {improvement.measures.map((m, i) => (
            <div className="measure-item" key={i}>
              <span className="measure-item__num">{i + 1}</span>
              <div>
                <strong className="measure-item__title">{m.title}</strong>
                <p className="measure-item__detail">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 메인 앱                                                               */
/* ------------------------------------------------------------------ */

function App() {
  const [dept, setDept] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    setError(null);
    try {
      const parsed = await readWorkbookFile(file);
      setDept(parsed);
    } catch (err) {
      setError(err);
    }
  };

  const resetAll = () => {
    setDept(null);
    setError(null);
  };

  const areaData = useMemo(() => {
    if (!dept) return [];
    return dept.areas.map((a) => ({ name: a, ...dept.areaStats[a] }));
  }, [dept]);

  if (!dept) {
    return (
      <div className="app-shell">
        <UploadScreen onFile={handleFile} error={error} isDragging={isDragging} setIsDragging={setIsDragging} />
      </div>
    );
  }



  return (
    <div className="app-shell">
      <header className="topbar no-print">
        <div className="topbar__title">
          <span className="topbar__badge">정보관리 점검</span>
          <h1>{dept.name} 분석 리포트</h1>
        </div>
        <div className="topbar__actions">
          <button className="btn btn--ghost" onClick={() => window.print()}>🖨️ 인쇄 / PDF</button>
          <button className="btn btn--ghost" onClick={resetAll}>🔄 새 파일 업로드</button>
        </div>
      </header>

      <main className="dashboard print-area">
        <section className="report-header-card">
          <div className="eyebrow">정보관리 점검 결과 · 미흡항목 개선 방안</div>
          <h2>{dept.name}</h2>
          <div className="report-header__meta">
            <StatusBadge status={dept.grade} size="lg" />
            <span className="mono report-header__score">종합 이행률 {dept.rate}%</span>
            <span className="mono report-header__score">미이행 문항 {dept.failedItems.length}건</span>
          </div>
          <div className="report-header__sub">
            {dept.examDate && <span>점검일자 {dept.examDate}</span>}
            {dept.inspector && <span>점검자 {dept.inspector}</span>}
            {dept.headcount !== "" && <span>점검인원 {dept.headcount}명</span>}
          </div>
        </section>

        <section className="charts-row no-print">
          <div className="panel panel--chart">
            <h2>점검 결과 분포</h2>
            <Donut yes={dept.yesCount} no={dept.noCount} />
            <div className="legend-row">
              <div className="legend-item"><span className="legend-dot" style={{ background: STATUS.excellent.color }} />예 {dept.yesCount}건</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: STATUS.poor.color }} />아니오 {dept.noCount}건</div>
            </div>
          </div>

          <div className="panel">
            <h2>영역별 이행률</h2>
            <div className="area-breakdown">
              {areaData.map((a) => (
                <div className="area-breakdown__row" key={a.name}>
                  <span className="area-breakdown__name">{a.name}</span>
                  <Bar value={a.rate} />
                  <span className="mono area-breakdown__counts">
                    예 {a.yes} · 아니오 {a.no} (총 {a.total}건)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="report-section">
          <h3>⚠️ 미흡항목 ({dept.failedItems.length}건)</h3>
          {dept.failedItems.length === 0 ? (
            <div className="all-clear">✅ '아니오' 응답 문항이 없어 추가 교육이 필요하지 않습니다.</div>
          ) : (
            <div className="guide-list">
              {dept.failedItems.map((item) => <ImprovementCard item={item} key={item.no} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 스타일 삽입                                                            */
/* ------------------------------------------------------------------ */

const styleTag = document.createElement("style");
styleTag.textContent = `
  body { margin: 0; }
  .app-shell {
    --bg: #F5F6F8; --surface: #FFFFFF; --surface-alt: #EEF1F4;
    --ink: #1B2430; --ink-soft: #5B6472; --border: #DDE2E8;
    --brand: #2A4D6E; --brand-soft: #E7EDF3; --accent: #B9862F;
    font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif;
    color: var(--ink); background: var(--bg); min-height: 100vh; width: 100%;
  }
  .app-shell * { box-sizing: border-box; }
  .mono { font-family: "SFMono-Regular", ui-monospace, "JetBrains Mono", Menlo, monospace; }

  .upload-screen { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 20px; overflow: hidden; }
  .upload-screen__ledger { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-evenly; padding: 0 6%; opacity: 0.5; pointer-events: none; }
  .ledger-row { display: flex; align-items: center; gap: 12px; color: var(--border); font-size: 11px; }
  .ledger-line { flex: 1; height: 1px; background: var(--border); }

  .upload-screen__content { position: relative; z-index: 1; max-width: 540px; width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 40px 36px; box-shadow: 0 1px 2px rgba(27,36,48,0.04), 0 12px 32px rgba(27,36,48,0.06); }
  .eyebrow { font-size: 12px; letter-spacing: 0.08em; color: var(--brand); font-weight: 700; margin-bottom: 10px; }
  .upload-screen h1 { font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.01em; }
  .lede { color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin: 0 0 28px; }

  .dropzone { border: 1.5px dashed var(--border); border-radius: 4px; padding: 36px 20px; text-align: center; cursor: pointer; color: var(--ink-soft); transition: border-color 0.15s ease, background 0.15s ease; background: var(--surface-alt); }
  .dropzone:hover { border-color: var(--brand); }
  .dropzone--active { border-color: var(--brand); background: var(--brand-soft); }
  .dropzone__icon { font-size: 26px; margin-bottom: 8px; }
  .dropzone__title { font-size: 14px; font-weight: 600; color: var(--ink); margin: 4px 0 2px; }
  .dropzone__sub { font-size: 12px; margin: 0; }

  .upload-error { display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; padding: 10px 12px; background: ${STATUS.poor.soft}; color: ${STATUS.poor.color}; border-radius: 4px; font-size: 13px; }

  .upload-screen__footer { margin-top: 24px; border-top: 1px solid var(--border); padding-top: 18px; }
  .hint { font-size: 12px; color: var(--ink-soft); line-height: 1.6; margin: 0; }

  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 32px; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; flex-wrap: wrap; gap: 10px; }
  .topbar__title { display: flex; align-items: baseline; gap: 10px; }
  .topbar__badge { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--brand); background: var(--brand-soft); padding: 3px 8px; border-radius: 3px; }
  .topbar__title h1 { font-size: 17px; font-weight: 800; margin: 0; }
  .topbar__actions { display: flex; align-items: center; gap: 10px; }

  .btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 4px; border: 1px solid var(--border); cursor: pointer; background: var(--surface); color: var(--ink); }
  .btn--ghost:hover { background: var(--surface-alt); }

  .dashboard { max-width: 900px; margin: 0 auto; padding: 28px 32px 64px; display: flex; flex-direction: column; gap: 20px; }

  .report-header-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px 28px; }
  .report-header-card h2 { font-size: 22px; font-weight: 800; margin: 4px 0 12px; }
  .report-header__meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .report-header__score { font-size: 13px; color: var(--ink-soft); font-weight: 700; }
  .report-header__sub { display: flex; gap: 14px; font-size: 12px; color: var(--ink-soft); flex-wrap: wrap; }

  .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: stretch; }
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 20px 22px; }
  .panel--chart { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .panel h2 { align-self: flex-start; font-size: 14px; font-weight: 700; margin: 0 0 14px; }

  .donut-wrap { display: flex; align-items: center; justify-content: center; padding: 10px 0; flex: 1; }
  .donut { width: 160px; height: 160px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .donut__hole { width: 96px; height: 96px; border-radius: 50%; background: var(--surface); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .donut__pct { font-size: 18px; font-weight: 800; }
  .donut__label { font-size: 10px; color: var(--ink-soft); margin-top: 2px; }

  .legend-row { display: flex; gap: 18px; justify-content: center; margin-top: 8px; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-soft); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

  .area-breakdown { display: flex; flex-direction: column; }
  .area-breakdown__row { display: grid; grid-template-columns: 70px 1fr auto; align-items: center; gap: 10px; padding: 9px 2px; border-bottom: 1px dashed var(--border); }
  .area-breakdown__row:last-child { border-bottom: none; }
  .area-breakdown__name { font-size: 12.5px; font-weight: 600; }
  .area-breakdown__counts { font-size: 11px; color: var(--ink-soft); white-space: nowrap; }

  .bar { display: flex; align-items: center; gap: 8px; }
  .bar__track { flex: 1; height: 6px; background: var(--surface-alt); border-radius: 3px; overflow: hidden; }
  .bar__fill { height: 100%; border-radius: 3px; }
  .bar__value { font-size: 11px; font-weight: 700; width: 36px; text-align: right; }
  .bar-na { font-size: 11px; color: var(--ink-soft); }

  .all-clear { display: flex; align-items: center; gap: 8px; color: ${STATUS.excellent.color}; background: ${STATUS.excellent.soft}; padding: 12px 14px; border-radius: 4px; font-size: 13px; font-weight: 600; }

  .badge { display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; border: 1px solid; width: fit-content; }
  .badge-lg { font-size: 12px; padding: 4px 12px; }

  .report-section { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 20px 22px; }
  .report-section h3 { font-size: 13px; font-weight: 700; margin: 0 0 14px; }

  .guide-list { display: flex; flex-direction: column; gap: 14px; }
  .guide-card { border: 1px solid var(--border); border-radius: 4px; padding: 16px 18px; background: var(--surface-alt); }
  .guide-card__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px; }
  .guide-card__area { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--ink-soft); font-weight: 700; }
  .guide-card__title { display: block; font-size: 14px; font-weight: 700; margin-top: 3px; line-height: 1.4; }
  .guide-card__actions { margin: 8px 0 0; padding-left: 18px; font-size: 12.5px; line-height: 1.8; }

  .dept-note { margin: 10px 0; padding: 10px 12px; background: var(--surface); border: 1px dashed var(--border); border-radius: 4px; }
  .dept-note__label { font-size: 11px; font-weight: 700; color: var(--ink-soft); }
  .dept-note p { font-size: 12.5px; margin: 4px 0; line-height: 1.5; }
  .dept-note__due { font-size: 11px; color: var(--accent); font-weight: 600; }

  .measure-block { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .measure-block__head { font-size: 12.5px; font-weight: 700; color: var(--brand); margin-bottom: 10px; }
  .measure-list { display: flex; flex-direction: column; gap: 10px; }
  .measure-item { display: flex; gap: 10px; align-items: flex-start; }
  .measure-item__num { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--brand-soft); color: var(--brand); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
  .measure-item__title { display: block; font-size: 13px; font-weight: 700; margin-bottom: 2px; }
  .measure-item__detail { font-size: 12.5px; color: var(--ink-soft); line-height: 1.5; margin: 0; }

  @media (max-width: 860px) {
    .charts-row { grid-template-columns: 1fr; }
    .dashboard { padding: 20px 16px 48px; }
    .topbar { padding: 14px 16px; }
  }

  @media print {
    .no-print { display: none !important; }
    .app-shell, .dashboard { background: #fff; }
    .dashboard { max-width: 100%; padding: 0; }
  }
`;
document.head.appendChild(styleTag);

/* ------------------------------------------------------------------ */
/* 렌더                                                                  */
/* ------------------------------------------------------------------ */

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
