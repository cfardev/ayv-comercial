import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	CustomerForm,
	type CustomerFormSubmitData,
} from "@/modules/customers/components/customer-form.js";
import { useCreateCustomer } from "@/modules/customers/hooks/use-customers.js";

export function ClienteCreatePage() {
	const navigate = useNavigate();
	const createCustomer = useCreateCustomer();
	const [formError, setFormError] = useState<string | null>(null);

	function goBack() {
		navigate("/clientes");
	}

	function onSubmit(data: CustomerFormSubmitData) {
		setFormError(null);
		createCustomer.mutate(data, {
			onSuccess: () => navigate("/clientes"),
			onError: (error) => setFormError(error.message),
		});
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col gap-3">
				<Button
					type="button"
					variant="ghost"
					className="cursor-pointer w-fit gap-2 -ml-2 text-muted-foreground"
					onClick={goBack}
				>
					<IconArrowLeft className="size-4" />
					Volver al listado
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Nuevo cliente
					</h1>
					<p className="text-muted-foreground text-sm">
						Completa los datos para registrar un nuevo cliente.
					</p>
				</div>
			</div>

			<CustomerForm
				active
				onSubmit={onSubmit}
				onCancel={goBack}
				errorMessage={formError}
				isLoading={createCustomer.isPending}
				idPrefix="customer-create"
			/>
		</div>
	);
}
