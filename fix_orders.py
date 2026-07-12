import re

with open("src/app/admin/orders/page.tsx", "r") as f:
    content = f.read()

# Fix popup buttons
content = content.replace('onClick={onDismiss}', 'onClick={onReject}')
content = content.replace(
    'className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[13px] font-bold text-gray-400 transition-colors hover:text-white"',
    'className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-red-900/40 bg-red-950/10 dark:bg-red-950/40 text-[13px] font-bold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/60"'
)
content = content.replace('>Later<', '><XCircle className="h-4 w-4 mr-1.5" />Reject<')
content = content.replace(
    'onClick={onDismiss}',
    '' # Remove from background click
)
content = content.replace(
    'className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"',
    'className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"'
)
content = content.replace('onDismiss: () => void;', 'onReject: () => void;')
content = content.replace('onDismiss={dismissPopup}', 'onReject={() => rejectFromPopup(currentPopupOrder)}')


# Inject Theme
content = content.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport { useAdminStore } from "@/stores/admin-store";\nimport { Sun, Moon } from "lucide-react";')

content = content.replace('export default function AdminOrdersPage() {', 'export default function AdminOrdersPage() {\n  const { theme, toggleTheme } = useAdminStore();')

content = content.replace('return (\n    <div className="min-h-dvh bg-gray-950 text-white">', 'return (\n    <div className={theme === "dark" ? "dark" : ""}>\n      <div className="min-h-dvh bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">')

content = content.replace('  ); \n}', '      </div>\n    </div>\n  ); \n}')
content = content.replace('  );\n}', '      </div>\n    </div>\n  );\n}')

# Add theme toggle button near refresh button
theme_btn = """            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
            </button>"""
content = content.replace('className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors"\n            >\n              <RefreshCw', theme_btn + '\n\n            <button\n              type="button"\n              onClick={load}\n              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"\n            >\n              <RefreshCw')

# Fix glitch & polling speed
content = content.replace('const t = setInterval(load, 12000);', 'const t = setInterval(load, 4000);')
content = content.replace("""      if (prevOrderIds.current.size > 0) {
        const fresh = incoming.filter((o) => !prevOrderIds.current.has(o.id));
        if (fresh.length > 0) {
          setNewCount((c) => c + fresh.length);
          // Add to popup queue
          setPendingOrders((prev) => [...prev, ...fresh]);
        }
      }""", """      if (prevOrderIds.current.size === 0) {
        const placed = incoming.filter(o => o.status === "placed");
        if (placed.length > 0) setPendingOrders(placed);
      } else {
        const fresh = incoming.filter((o) => !prevOrderIds.current.has(o.id) && o.status === "placed");
        if (fresh.length > 0) {
          setNewCount((c) => c + fresh.length);
          setPendingOrders((prev) => {
            const arr = [...prev];
            fresh.forEach(f => { if (!arr.find(x => x.id === f.id)) arr.push(f); });
            return arr;
          });
        }
      }""")

content = content.replace('async function acceptFromPopup', 'async function rejectFromPopup(order: AdminOrder) {\n    stopRing();\n    setPendingOrders((prev) => prev.slice(1));\n    await updateStatus(order.id, "cancelled");\n  }\n\n  async function acceptFromPopup')

# Replace Dark Mode specific classes throughout
replacements = [
    ('bg-gray-950/95', 'bg-white/95 dark:bg-gray-950/95'),
    ('border-white/10', 'border-gray-200 dark:border-white/10'),
    ('border-white/8', 'border-gray-200 dark:border-white/8'),
    ('bg-white/5', 'bg-white dark:bg-white/5'),
    ('bg-white/8', 'bg-white dark:bg-white/8'),
    ('bg-white/10', 'bg-gray-100 dark:bg-white/10'),
    ('bg-white/15', 'bg-gray-200 dark:bg-white/15'),
    ('bg-white/20', 'bg-gray-200 dark:bg-white/20'),
    ('text-white', 'text-gray-900 dark:text-white'),
    ('text-gray-400', 'text-gray-500 dark:text-gray-400'),
    ('text-gray-300', 'text-gray-700 dark:text-gray-300'),
    ('text-gray-200', 'text-gray-800 dark:text-gray-200'),
    ('bg-gray-900', 'bg-white dark:bg-gray-900'),
    ('bg-black/30', 'bg-gray-50 dark:bg-black/30'),
    ('bg-black/20', 'bg-gray-50 dark:bg-black/20'),
    ('hover:text-white', 'hover:text-gray-900 dark:hover:text-white'),
    ('hover:bg-white/12', 'hover:bg-gray-100 dark:hover:bg-white/12'),
    ('hover:border-white/15', 'hover:border-gray-300 dark:hover:border-white/15'),
    ('shadow-md shadow-brand-orange/40', 'shadow-md shadow-brand-orange/20 dark:shadow-brand-orange/40'),
    ('border-brand-orange/30', 'border-brand-orange/30 dark:border-brand-orange/30'),
]

for old, new_c in replacements:
    # Basic attempt, some classes might be nested or over-replaced
    # We will just replace common occurrences.
    content = content.replace(old, new_c)

# Some fixes for over-replaced stuff
content = content.replace('text-gray-900 dark:text-gray-900 dark:text-white', 'text-gray-900 dark:text-white')
content = content.replace('text-white"', 'text-white"') # wait
content = content.replace('text-[13px] font-extrabold leading-none text-gray-900 dark:text-white', 'text-[13px] font-extrabold leading-none text-gray-900 dark:text-white')

with open("src/app/admin/orders/page.tsx", "w") as f:
    f.write(content)

