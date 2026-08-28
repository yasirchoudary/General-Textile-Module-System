import { PartyForm } from "@/components/finance/party-form";

export default async function EditPartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PartyForm partyId={id} />;
}
