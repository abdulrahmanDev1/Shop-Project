const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value

    const prodElement = btn.closest('article')

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn2 ',
            cancelButton: 'btn2 danger'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/admin/product/' + prodId, {
                    method: 'DELETE',
                    headers: {
                        'csrf-token': csrf
                    }
                })
                .then(result => {
                    return result.json()
                })
                .then(data => {
                    console.log(data)
                    prodElement.parentNode.removeChild(prodElement);
                    Swal.fire(
                        'Success!',
                        'Product Deleted Successfully',
                        'success'
                    )
                })
                .catch(err => console.log(err));
            swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary Product is safe :)',
                'error'
            )
        }
    })
}