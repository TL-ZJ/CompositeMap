import { ROLES, type RoleId } from "@/lib/m2a-domain";

/**
 * 四角色徽章（UR / KB / M2A / LLM）。
 * `order` 控制显示顺序（两个界面头部的角色次序不同）。
 */
export function RoleBadges({
  order,
  demo,
}: {
  order?: RoleId[];
  demo?: string;
}) {
  const ids = order ?? ROLES.map((r) => r.id);
  const list = ids
    .map((id) => ROLES.find((r) => r.id === id))
    .filter((r): r is (typeof ROLES)[number] => !!r);
  return (
    <div className="roles">
      {list.map((r) => (
        <span key={r.id} className={`role ${r.className}`}>
          <b>
            {r.order} {r.id}
          </b>{" "}
          {r.name}
        </span>
      ))}
      {demo ? <span className="tag-demo">{demo}</span> : null}
    </div>
  );
}
