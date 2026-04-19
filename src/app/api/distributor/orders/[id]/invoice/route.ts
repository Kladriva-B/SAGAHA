import type { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireDistributorSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, handleRouteError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const limited = consumeRateLimit(request, "distributor");
    if (limited) return limited;

    const { distributor } = await requireDistributorSession();
    const { id } = context.params;

    const order = await prisma.order.findFirst({
      where: { id, distributorId: distributor.id },
      include: {
        items: { include: { product: { select: { name: true } } } },
        distributor: { select: { companyName: true, region: true, phone: true, address: true } },
      },
    });
    if (!order) throw new ApiError(404, "Not Found");

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let y = height - 48;
    const line = (text: string, size = 10, f = font) => {
      page.drawText(text, {
        x: 48,
        y,
        size,
        font: f,
        color: rgb(0.1, 0.15, 0.1),
        maxWidth: 500,
      });
      y -= size + 6;
    };

    line("SAGAHA SARL — Facture", 16, bold);
    line(`Commande : ${order.id}`);
    line(`Date : ${order.createdAt.toLocaleString("fr-FR")}`);
    line(`Statut : ${order.status}`);
    y -= 8;
    line(order.distributor.companyName, 12, bold);
    if (order.distributor.region) line(order.distributor.region);
    if (order.distributor.phone) line(`Tél. ${order.distributor.phone}`);
    if (order.distributor.address) line(order.distributor.address);
    y -= 12;
    line("Détail", 11, bold);
    for (const it of order.items) {
      const unit = Number(it.unitPrice);
      const tot = unit * it.quantity;
      line(`${it.product.name} × ${it.quantity} @ ${unit.toLocaleString("fr-FR")} = ${tot.toLocaleString("fr-FR")} XAF`);
    }
    y -= 8;
    line(`Total TTC (XAF) : ${Number(order.totalAmount).toLocaleString("fr-FR")}`, 12, bold);

    const bytes = await pdf.save();
    const filename = `sagaha-facture-${order.id.slice(0, 10)}.pdf`;

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fail(404, e.message);
    return handleRouteError(e);
  }
}
