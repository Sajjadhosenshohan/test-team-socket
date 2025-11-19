import SolicitationDocEditor from "@/app/components/SolicitationEditor";

export default async function EditSolicitationPage({ params }: { params: Promise<{ docId: string }> }) {
  const paramsResolved = await params;
  
  return (
    <SolicitationDocEditor docId={paramsResolved.docId} />
  );
}


